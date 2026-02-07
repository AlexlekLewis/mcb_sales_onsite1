import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Product, ProductExtra } from '../../quoting/types';
import { ArrowLeft, Save, Loader2, Trash2, Star, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRICING_TYPES } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

import { getPricingDataSchema } from '../../../lib/schemas';
import { ZodError } from 'zod';

type ExtraZone = 'promoted' | 'accordion' | 'hidden';

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

    // --- Extras Picker State ---
    const [availableExtras, setAvailableExtras] = useState<ProductExtra[]>([]);
    const [extraZones, setExtraZones] = useState<Record<string, ExtraZone>>({});
    const [expandedPickerCategories, setExpandedPickerCategories] = useState<Set<string>>(new Set());
    const [extrasLoading, setExtrasLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        } else {
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

    // Fetch extras when product supplier+category changes
    useEffect(() => {
        const sup = formData.supplier;
        const cat = formData.category;
        if (!sup || !cat) {
            setAvailableExtras([]);
            return;
        }

        const fetchExtras = async () => {
            setExtrasLoading(true);
            const { data } = await supabase
                .from('product_extras')
                .select('*')
                .eq('supplier', sup)
                .eq('product_category', cat)
                .eq('is_active', true)
                .order('extra_category, name');

            const extras = (data || []) as ProductExtra[];
            setAvailableExtras(extras);

            // Initialize zones from existing quote_config
            const config = formData.quote_config || {};
            const promoted = new Set(config.promoted_extras || []);
            const enabled = new Set(config.enabled_extras || []);

            const zones: Record<string, ExtraZone> = {};
            extras.forEach(e => {
                if (promoted.has(e.id)) {
                    zones[e.id] = 'promoted';
                } else if (enabled.has(e.id)) {
                    zones[e.id] = 'accordion';
                } else if (promoted.size > 0 || enabled.size > 0) {
                    zones[e.id] = 'hidden';
                } else {
                    zones[e.id] = 'accordion';
                }
            });
            setExtraZones(zones);
            setExtrasLoading(false);
        };

        fetchExtras();
    }, [formData.supplier, formData.category]);

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

    // Group extras by category for the picker
    const groupedAvailableExtras = useMemo(() => {
        const groups: Record<string, ProductExtra[]> = {};
        availableExtras.forEach(e => {
            const cat = e.extra_category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(e);
        });
        return groups;
    }, [availableExtras]);

    const setExtraZone = (extraId: string, zone: ExtraZone) => {
        setExtraZones(prev => ({ ...prev, [extraId]: zone }));
    };

    const setCategoryZone = (category: string, zone: ExtraZone) => {
        const items = groupedAvailableExtras[category] || [];
        setExtraZones(prev => {
            const next = { ...prev };
            items.forEach(e => { next[e.id] = zone; });
            return next;
        });
    };

    const togglePickerCategory = (cat: string) => {
        setExpandedPickerCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Counts for summary
    const zoneCounts = useMemo(() => {
        let promoted = 0, accordion = 0, hidden = 0;
        Object.values(extraZones).forEach(z => {
            if (z === 'promoted') promoted++;
            else if (z === 'accordion') accordion++;
            else hidden++;
        });
        return { promoted, accordion, hidden, total: availableExtras.length };
    }, [extraZones, availableExtras]);

    const handleSave = async () => {
        if (jsonError) {
            alert('Please fix JSON errors before saving');
            return;
        }

        setSaving(true);
        let parsedData;

        try {
            parsedData = JSON.parse(jsonString);
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

        // Build promoted_extras and enabled_extras from zone assignments
        const promotedIds: string[] = [];
        const enabledIds: string[] = [];
        Object.entries(extraZones).forEach(([extraId, zone]) => {
            if (zone === 'promoted') promotedIds.push(extraId);
            else if (zone === 'accordion') enabledIds.push(extraId);
        });

        const productData = {
            ...formData,
            pricing_data: parsedData,
            quote_config: {
                ...formData.quote_config,
                promoted_extras: promotedIds,
                enabled_extras: enabledIds,
            }
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

                {/* ─── Two-Zone Extras Picker ─── */}
                {availableExtras.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Extras Layout</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Control where each extra appears in the quote configurator
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                                    <Star size={12} />
                                    {zoneCounts.promoted} Promoted
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                                    <Eye size={12} />
                                    {zoneCounts.accordion} Accordion
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-medium">
                                    <EyeOff size={12} />
                                    {zoneCounts.hidden} Hidden
                                </span>
                            </div>
                        </div>

                        {/* Zone Legend */}
                        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-semibold text-xs mb-1">
                                    <Star size={12} />
                                    Promoted
                                </div>
                                <p className="text-[10px] text-slate-500">Always visible in configurator</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-blue-400 font-semibold text-xs mb-1">
                                    <Eye size={12} />
                                    Accordion
                                </div>
                                <p className="text-[10px] text-slate-500">In collapsed extras section</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1.5 text-slate-500 font-semibold text-xs mb-1">
                                    <EyeOff size={12} />
                                    Hidden
                                </div>
                                <p className="text-[10px] text-slate-500">Not shown to sales reps</p>
                            </div>
                        </div>

                        {extrasLoading ? (
                            <div className="flex items-center justify-center py-8 text-slate-400">
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Loading extras...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(groupedAvailableExtras).map(([category, items]) => {
                                    const isExpanded = expandedPickerCategories.has(category);
                                    const catPromoted = items.filter(i => extraZones[i.id] === 'promoted').length;
                                    const catAccordion = items.filter(i => extraZones[i.id] === 'accordion').length;

                                    return (
                                        <div key={category} className="border border-white/5 rounded-xl bg-[#1c1c24] overflow-hidden">
                                            <button
                                                onClick={() => togglePickerCategory(category)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-sm text-white">{category}</span>
                                                    <span className="text-xs text-slate-500">({items.length})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {catPromoted > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">{catPromoted}</span>
                                                    )}
                                                    {catAccordion > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">{catAccordion}</span>
                                                    )}
                                                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-4 pb-3 border-t border-white/5">
                                                    {/* Bulk Actions */}
                                                    <div className="flex gap-2 py-2 mb-2 border-b border-white/5">
                                                        <button
                                                            onClick={() => setCategoryZone(category, 'promoted')}
                                                            className="text-[10px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors font-medium"
                                                        >
                                                            All → Promoted
                                                        </button>
                                                        <button
                                                            onClick={() => setCategoryZone(category, 'accordion')}
                                                            className="text-[10px] px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-medium"
                                                        >
                                                            All → Accordion
                                                        </button>
                                                        <button
                                                            onClick={() => setCategoryZone(category, 'hidden')}
                                                            className="text-[10px] px-2 py-1 rounded-md bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors font-medium"
                                                        >
                                                            All → Hidden
                                                        </button>
                                                    </div>

                                                    {/* Individual Extras */}
                                                    <div className="space-y-1">
                                                        {items.map(extra => {
                                                            const zone = extraZones[extra.id] || 'accordion';
                                                            return (
                                                                <div key={extra.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
                                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                        <span className="text-sm text-slate-300 truncate">{extra.name}</span>
                                                                        <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">${extra.price}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                                                                        <button
                                                                            onClick={() => setExtraZone(extra.id, 'promoted')}
                                                                            title="Promoted — always visible"
                                                                            className={cn(
                                                                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                                                zone === 'promoted'
                                                                                    ? "bg-amber-500/20 text-amber-400"
                                                                                    : "text-slate-600 hover:text-amber-400 hover:bg-amber-500/10"
                                                                            )}
                                                                        >
                                                                            <Star size={13} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setExtraZone(extra.id, 'accordion')}
                                                                            title="Accordion — collapsed section"
                                                                            className={cn(
                                                                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                                                zone === 'accordion'
                                                                                    ? "bg-blue-500/20 text-blue-400"
                                                                                    : "text-slate-600 hover:text-blue-400 hover:bg-blue-500/10"
                                                                            )}
                                                                        >
                                                                            <Eye size={13} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setExtraZone(extra.id, 'hidden')}
                                                                            title="Hidden — not shown"
                                                                            className={cn(
                                                                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                                                zone === 'hidden'
                                                                                    ? "bg-slate-500/20 text-slate-400"
                                                                                    : "text-slate-600 hover:text-slate-400 hover:bg-slate-500/10"
                                                                            )}
                                                                        >
                                                                            <EyeOff size={13} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>

        </div>
    );
}
