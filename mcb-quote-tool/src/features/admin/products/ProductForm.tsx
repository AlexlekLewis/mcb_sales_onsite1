import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../quoting/types';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRICING_TYPES } from '../../../lib/constants';

import { getPricingDataSchema } from '../../../lib/schemas';
import { ZodError } from 'zod';

export function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        category: '',
        supplier: '',
        pricing_type: 'grid',
        pricing_data: {}
    });

    const [jsonError, setJsonError] = useState<string | null>(null);
    const [jsonString, setJsonString] = useState('{}');

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        } else {
            // Reset form for New Product
            setFormData({
                name: '',
                category: '',
                supplier: '',
                pricing_type: 'grid',
                pricing_data: {},
                quote_config: {
                    show_width: true,
                    show_drop: true,
                    show_fabric: true,
                    show_extras: true,
                    show_fullness: false
                }
            });
            setJsonString('{}');
            setJsonError(null);
            setLoading(false);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (data) {
            setFormData(data);
            setJsonString(JSON.stringify(data.pricing_data, null, 4));
        }
        if (error) {
            console.error('Error fetching product:', error);
            alert('Error loading product');
        }
        setLoading(false);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setJsonString(val);
        try {
            const parsed = JSON.parse(val);
            setFormData(prev => ({ ...prev, pricing_data: parsed }));
            setJsonError(null);
        } catch (err) {
            setJsonError((err as Error).message);
        }
    };

    const handleSave = async () => {
        if (jsonError) {
            alert('Please fix JSON errors before saving');
            return;
        }

        setSaving(true);
        let parsedData;

        try {
            parsedData = JSON.parse(jsonString);

            // Validate against Zod Schema
            const schema = getPricingDataSchema(formData.pricing_type || 'grid');
            schema.parse(parsedData);

        } catch (err) {
            setSaving(false);
            if (err instanceof ZodError) {
                const zodError = err as ZodError;
                const messages = zodError.errors.map((e: { path: (string | number)[]; message: string }) => `${e.path.join('.')}: ${e.message}`).join('\n');
                alert(`Validation Failed:\n${messages}`);
            } else if (err instanceof SyntaxError) {
                alert('Invalid JSON syntax');
            } else {
                alert('Validation error occurred');
            }
            return;
        }

        const productData = {
            ...formData,
            pricing_data: parsedData
        };

        let error;
        if (id) {
            const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('products')
                .insert(productData);
            error = insertError;
        }

        setSaving(false);
        if (error) {
            console.error('Error saving:', error);
            alert(`Error saving product: ${error.message}`);
        } else {
            navigate('/admin/products');
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setSaving(true);
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting product');
            setSaving(false);
        } else {
            navigate('/admin/products');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} className="text-slate-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {id ? 'Edit Product' : 'New Product'}
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
                        disabled={saving || !!jsonError}
                        className="px-6 py-2 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-background-card rounded-2xl border border-white/5 p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="e.g. Roller Blind"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value="">Select Category...</option>
                            {Object.values(PRODUCT_CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supplier</label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                            placeholder="e.g. Creative"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pricing Type</label>
                        <select
                            value={formData.pricing_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, pricing_type: e.target.value }))}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                        >
                            <option value={PRICING_TYPES.UNIT}>Unit Price (Simple)</option>
                        </select>
                    </div>

                    <div className="flex items-end pb-3">
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors w-full">
                            <input
                                type="checkbox"
                                checked={formData.is_active ?? true}
                                onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-600 text-brand-orange focus:ring-brand-orange bg-[#1c1c24]"
                            />
                            <div>
                                <span className="block text-sm font-semibold text-white">Active Status</span>
                                <span className="text-xs text-slate-400">Uncheck to hide this product from new quotes</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                        Pricing Data (JSON)
                        {jsonError && <span className="text-red-400 normal-case">{jsonError}</span>}
                    </label>
                    <p className="text-xs text-slate-300 mb-2">
                        Configure steps, grids, and matrices here.
                        Valid props: <code>width_steps</code>, <code>drop_steps</code>, <code>grid</code>, <code>grids</code>.
                    </p>
                    <textarea
                        value={jsonString}
                        onChange={handleJsonChange}
                        className={`w-full h-96 font-mono text-sm bg-background border rounded-xl p-4 text-slate-200 focus:outline-none resize-y ${jsonError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-brand-orange'
                            }`}
                        spellCheck={false}
                    />
                </div>

                {/* Quote Configuration */}
                <div className="pt-6 border-t border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4">Quote Configuration</h3>
                    <p className="text-sm text-slate-300 mb-6">
                        Customize how this product appears in the Quote Tool. Toggle fields to show/hide them.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Toggles */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-200 uppercase tracking-wider">Visibility</h4>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.quote_config?.show_width ?? true}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        quote_config: { ...prev.quote_config, show_width: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1c24]"
                                />
                                <span className="text-white">Show Width</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.quote_config?.show_drop ?? true}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        quote_config: { ...prev.quote_config, show_drop: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1c24]"
                                />
                                <span className="text-white">Show Drop</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.quote_config?.show_fabric ?? true}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        quote_config: { ...prev.quote_config, show_fabric: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1c24]"
                                />
                                <span className="text-white">Show Fabric / Price Group</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.quote_config?.show_extras ?? true}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        quote_config: { ...prev.quote_config, show_extras: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1c24]"
                                />
                                <span className="text-white">Show Extras</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.quote_config?.show_fullness ?? false}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        quote_config: { ...prev.quote_config, show_fullness: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#1c1c24]"
                                />
                                <span className="text-white">Show Fullness (Curtains)</span>
                            </label>
                        </div>

                        {/* Labels */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-200 uppercase tracking-wider">Custom Labels</h4>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Width Label</label>
                                <input
                                    type="text"
                                    value={formData.quote_config?.label_width || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quote_config: { ...prev.quote_config, label_width: e.target.value } }))}
                                    className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                                    placeholder="Default: Width (mm)"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drop Label</label>
                                <input
                                    type="text"
                                    value={formData.quote_config?.label_drop || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quote_config: { ...prev.quote_config, label_drop: e.target.value } }))}
                                    className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                                    placeholder="Default: Drop (mm)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
