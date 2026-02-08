import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Fabric, PriceGroup } from '../../quoting/types';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';

export function FabricForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<Fabric>>({
        brand: '',
        name: '',
        price_group: '',
        supplier: '',
        product_category: '', // Changed from 'category' to match DB column commonly used or mapped
    });

    useEffect(() => {
        Promise.all([
            fetchPriceGroups(),
            id ? fetchFabric(id) : Promise.resolve()
        ]).then(() => setLoading(false));
    }, [id]);

    const fetchPriceGroups = async () => {
        const { data } = await supabase.from('price_groups').select('*').order('group_code');
        if (data) setPriceGroups(data);
    };

    const fetchFabric = async (fabricId: string) => {
        const { data, error } = await supabase
            .from('fabrics')
            .select('*')
            .eq('id', fabricId)
            .single();

        if (data) setFormData(data);
        if (error) console.error('Error fetching fabric:', error);
    };

    const handleSave = async () => {
        if (!formData.brand || !formData.name || !formData.price_group) {
            alert('Please fill in all required fields');
            return;
        }

        setSaving(true);
        let error;
        if (id) {
            const { error: updateError } = await supabase
                .from('fabrics')
                .update(formData)
                .eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('fabrics')
                .insert(formData);
            error = insertError;
        }

        setSaving(false);
        if (error) {
            alert(`Error saving fabric: ${error.message}`);
        } else {
            navigate('/admin/fabrics');
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this fabric?')) return;

        setSaving(true);
        const { error } = await supabase.from('fabrics').delete().eq('id', id);

        if (error) {
            alert('Error deleting fabric');
            setSaving(false);
        } else {
            navigate('/admin/fabrics');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-white" /></div>;

    // Filter price groups by selected supplier if available, else show all
    const availablePriceGroups = formData.supplier
        ? priceGroups.filter(pg => pg.supplier === formData.supplier)
        : priceGroups;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/fabrics')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} className="text-slate-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {id ? 'Edit Fabric' : 'New Fabric'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    {id && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-background-card rounded-2xl border border-white/5 p-6 space-y-6">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supplier</label>
                    <input
                        type="text"
                        value={formData.supplier || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                        className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="e.g. Texstyle"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand / Collection</label>
                        <input
                            type="text"
                            value={formData.brand || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="e.g. KleenScreen"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fabric Name</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="e.g. White"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price Group</label>
                        <div className="relative">
                            <input
                                list="price-groups"
                                value={formData.price_group || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, price_group: e.target.value }))}
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                                placeholder="Select or type group code..."
                            />
                            <datalist id="price-groups">
                                {availablePriceGroups.map(pg => (
                                    <option key={pg.id} value={pg.group_code}>
                                        {pg.group_name} ({pg.supplier})
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Match this with a Group Code from Price Groups.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Category</label>
                        <select
                            value={formData.product_category || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, product_category: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select Category...</option>
                            <option value="Internal Blinds">Internal Blinds</option>
                            <option value="Curtains">Curtains</option>
                            <option value="Plantation Shutters">Plantation Shutters</option>
                            <option value="External Blinds">External Blinds</option>
                            <option value="Roller Shutters">Roller Shutters</option>
                            <option value="Security Doors">Security Doors</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
