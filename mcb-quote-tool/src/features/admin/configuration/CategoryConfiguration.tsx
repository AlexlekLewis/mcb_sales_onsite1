import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product, Fabric, PriceGroup, ProductExtra } from '../../quoting/types';
import { X, Check, Loader2, Save, Wrench, ChevronDown, Star, EyeOff, GripVertical } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CategoryConfigurationProps {
    category: string;
    onClose: () => void;
}

type ExtraZone = 'promoted' | 'accordion' | 'hidden';

export function CategoryConfiguration({ category, onClose }: CategoryConfigurationProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Zone assignment state
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [extraZones, setExtraZones] = useState<Record<string, ExtraZone>>({});
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Detail popup state
    const [selectedExtra, setSelectedExtra] = useState<ProductExtra | null>(null);

    useEffect(() => {
        fetchData();
    }, [category]);

    const fetchData = async () => {
        setLoading(true);
        const [productsRes, fabricsRes, groupsRes, extrasRes] = await Promise.all([
            supabase.from('products').select('*').eq('category', category).order('name'),
            supabase.from('fabrics').select('*').eq('product_category', category).order('brand, name'),
            supabase.from('price_groups').select('*').eq('category', category).order('group_name'),
            supabase.from('product_extras').select('*').or(`product_category.eq.${category},product_category.eq.General`).order('extra_category, name'),
        ]);

        if (productsRes.data) setProducts(productsRes.data);
        if (fabricsRes.data) setFabrics(fabricsRes.data);
        if (groupsRes.data) setPriceGroups(groupsRes.data);
        if (extrasRes.data) setExtras(extrasRes.data);

        // Auto-select first product
        if (productsRes.data && productsRes.data.length > 0) {
            const firstProduct = productsRes.data[0];
            setSelectedProductId(firstProduct.id);
            initZonesFromProduct(firstProduct, extrasRes.data || []);
        }

        setLoading(false);
    };

    const initZonesFromProduct = (product: Product, allExtras: ProductExtra[]) => {
        const config = product.quote_config || {};
        const promoted = new Set(config.promoted_extras || []);
        const enabled = new Set(config.enabled_extras || []);

        const zones: Record<string, ExtraZone> = {};
        allExtras.forEach(e => {
            if (promoted.has(e.id)) {
                zones[e.id] = 'promoted';
            } else if (enabled.has(e.id)) {
                zones[e.id] = 'accordion';
            } else if (promoted.size > 0 || enabled.size > 0) {
                zones[e.id] = 'hidden';
            } else {
                // Default: all in accordion when no config exists
                zones[e.id] = 'accordion';
            }
        });
        setExtraZones(zones);
    };

    // When product changes, load its zone config
    const handleProductChange = useCallback(async (productId: string) => {
        if (selectedProductId) {
            await saveZonesToProduct(selectedProductId);
        }
        setSelectedProductId(productId);
        const product = products.find(p => p.id === productId);
        if (product) {
            initZonesFromProduct(product, extras);
        }
    }, [selectedProductId, products, extras, extraZones]);

    const saveZonesToProduct = async (productId: string) => {
        const promotedIds: string[] = [];
        const enabledIds: string[] = [];
        Object.entries(extraZones).forEach(([id, zone]) => {
            if (zone === 'promoted') promotedIds.push(id);
            else if (zone === 'accordion') enabledIds.push(id);
        });

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const updatedConfig = {
            ...product.quote_config,
            promoted_extras: promotedIds,
            enabled_extras: enabledIds,
        };

        await supabase
            .from('products')
            .update({ quote_config: updatedConfig })
            .eq('id', productId);

        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, quote_config: updatedConfig } : p
        ));
    };

    const toggleActive = async (table: 'products' | 'fabrics' | 'price_groups' | 'product_extras', id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        if (table === 'products') setProducts(products.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
        if (table === 'fabrics') setFabrics(fabrics.map(f => f.id === id ? { ...f, is_active: newStatus } : f));
        if (table === 'price_groups') setPriceGroups(priceGroups.map(g => g.id === id ? { ...g, is_active: newStatus } : g));
        if (table === 'product_extras') setExtras(extras.map(e => e.id === id ? { ...e, is_active: newStatus } : e));

        const { error } = await supabase.from(table).update({ is_active: newStatus }).eq('id', id);
        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    // Group extras by category
    const groupedExtras = useMemo(() => {
        const groups: Record<string, ProductExtra[]> = {};
        extras.forEach(e => {
            const cat = e.extra_category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(e);
        });
        return groups;
    }, [extras]);

    const zoneCounts = useMemo(() => {
        let promoted = 0, accordion = 0, hidden = 0;
        Object.values(extraZones).forEach(z => {
            if (z === 'promoted') promoted++;
            else if (z === 'accordion') accordion++;
            else hidden++;
        });
        return { promoted, accordion, hidden };
    }, [extraZones]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Cycle zone: promoted -> accordion -> hidden -> promoted
    const cycleZone = (extraId: string) => {
        setExtraZones(prev => {
            const current = prev[extraId] || 'accordion';
            const next: ExtraZone =
                current === 'promoted' ? 'accordion' :
                    current === 'accordion' ? 'hidden' : 'promoted';
            return { ...prev, [extraId]: next };
        });
    };

    const setZone = (extraId: string, zone: ExtraZone) => {
        setExtraZones(prev => ({ ...prev, [extraId]: zone }));
    };

    // Save & close
    const handleDone = async () => {
        setSaving(true);
        if (selectedProductId) {
            await saveZonesToProduct(selectedProductId);
        }
        setSaving(false);
        onClose();
    };

    // Zone badge component
    const ZoneBadge = ({ zone, small = false }: { zone: ExtraZone; small?: boolean }) => {
        const config = {
            promoted: { icon: Star, label: 'Promoted', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
            accordion: { icon: Wrench, label: 'Accordion', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
            hidden: { icon: EyeOff, label: 'Hidden', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
        }[zone];
        const Icon = config.icon;
        return (
            <span className={cn(
                "inline-flex items-center gap-1 rounded-full border font-medium",
                config.bg, config.text, config.border,
                small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
            )}>
                <Icon size={small ? 8 : 10} />
                {config.label}
            </span>
        );
    };

    // Bulk toggle all items in a section
    const bulkToggleAll = async (table: 'products' | 'fabrics' | 'price_groups', items: any[], activate: boolean) => {
        // Optimistic UI update
        const ids = items.map(i => i.id);
        if (table === 'products') setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, is_active: activate } : p));
        if (table === 'fabrics') setFabrics(prev => prev.map(f => ids.includes(f.id) ? { ...f, is_active: activate } : f));
        if (table === 'price_groups') setPriceGroups(prev => prev.map(g => ids.includes(g.id) ? { ...g, is_active: activate } : g));

        for (const id of ids) {
            await supabase.from(table).update({ is_active: activate }).eq('id', id);
        }
    };

    // Bulk set zone for all extras in a category
    const bulkSetZone = (categoryExtras: ProductExtra[], zone: ExtraZone) => {
        setExtraZones(prev => {
            const next = { ...prev };
            categoryExtras.forEach(e => { next[e.id] = zone; });
            return next;
        });
    };

    // Render simple toggle sections (Products, Fabrics, Price Groups)
    const renderToggleSection = (title: string, items: any[], table: 'products' | 'fabrics' | 'price_groups', nameKey: string = 'name') => {
        if (items.length === 0) return null;
        const allActive = items.every(i => i.is_active !== false);
        const noneActive = items.every(i => i.is_active === false);
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        {title} ({items.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => bulkToggleAll(table, items, true)}
                            disabled={allActive}
                            className={cn(
                                "text-[11px] font-medium px-3 py-1 rounded-lg border transition-all",
                                allActive
                                    ? "border-white/5 text-slate-600 cursor-not-allowed"
                                    : "border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"
                            )}
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => bulkToggleAll(table, items, false)}
                            disabled={noneActive}
                            className={cn(
                                "text-[11px] font-medium px-3 py-1 rounded-lg border transition-all",
                                noneActive
                                    ? "border-white/5 text-slate-600 cursor-not-allowed"
                                    : "border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                            )}
                        >
                            Unselect All
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(item => {
                        const isActive = item.is_active !== false;
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleActive(table, item.id, isActive)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                                    isActive
                                        ? "bg-brand-orange/10 border-brand-orange/30 hover:bg-brand-orange/20"
                                        : "bg-background-card border-white/5 hover:border-white/10 opacity-60"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                    isActive ? "bg-brand-orange-light text-white" : "bg-white/10 text-transparent"
                                )}>
                                    <Check size={14} className="font-bold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-medium truncate", isActive ? "text-white" : "text-slate-400")}>
                                        {item[nameKey] || item.group_name}
                                    </p>
                                    {item.brand && <p className="text-xs text-slate-400">{item.brand}</p>}
                                    {item.supplier && <p className="text-xs text-slate-400 truncate">{item.supplier}</p>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render extra detail popup (appears when clicking an extra)
    const renderExtraPopup = () => {
        if (!selectedExtra) return null;
        const zone = extraZones[selectedExtra.id] || 'accordion';

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedExtra(null)}>
                <div className="bg-[#1e1e2a] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{selectedExtra.name}</h3>
                            <p className="text-sm text-slate-400">{selectedExtra.extra_category || 'General'}</p>
                        </div>
                        <button onClick={() => setSelectedExtra(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-sm text-slate-300">Price</span>
                        <span className="text-lg font-bold text-white font-mono">${selectedExtra.price}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Assign to Zone</p>
                    <div className="space-y-2">
                        {([
                            { zone: 'promoted' as ExtraZone, icon: Star, label: 'Promoted — Always Visible', desc: 'Shown prominently at the top of extras', color: 'amber' },
                            { zone: 'accordion' as ExtraZone, icon: Wrench, label: 'Accordion — Collapsed Section', desc: 'Grouped in expandable category sections', color: 'blue' },
                            { zone: 'hidden' as ExtraZone, icon: EyeOff, label: 'Hidden — Not Shown', desc: 'Won\'t appear in the Quote Builder', color: 'slate' },
                        ]).map(opt => {
                            const isSelected = zone === opt.zone;
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.zone}
                                    onClick={() => {
                                        setZone(selectedExtra.id, opt.zone);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left",
                                        isSelected
                                            ? opt.color === 'amber' ? "bg-amber-500/10 border-amber-500/40" :
                                                opt.color === 'blue' ? "bg-blue-500/10 border-blue-500/40" :
                                                    "bg-slate-500/10 border-slate-500/40"
                                            : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        isSelected
                                            ? opt.color === 'amber' ? "bg-amber-500/20 text-amber-400" :
                                                opt.color === 'blue' ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-slate-500/20 text-slate-400"
                                            : "bg-white/5 text-slate-500"
                                    )}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-medium", isSelected ? "text-white" : "text-slate-300")}>{opt.label}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                                    </div>
                                    {isSelected && (
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center",
                                            opt.color === 'amber' ? "bg-amber-500" :
                                                opt.color === 'blue' ? "bg-blue-500" :
                                                    "bg-slate-500"
                                        )}>
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a24] w-full max-w-5xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a24] shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Configure {category}</h2>
                        <p className="text-slate-300 mt-1">Toggle visibility and configure extras layout for the Quote Builder.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-brand-orange" size={40} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Products, Price Groups, Fabrics */}
                            {renderToggleSection('Products / Models', products, 'products')}
                            {renderToggleSection('Price Groups', priceGroups, 'price_groups', 'group_name')}
                            {renderToggleSection('Fabrics', fabrics, 'fabrics')}

                            {/* Extras Layout Configuration */}
                            {extras.length > 0 && (
                                <div>
                                    {/* Section header with zone counters */}
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            Extras Layout Configuration
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                                                <Star size={11} /> {zoneCounts.promoted}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                <Wrench size={11} /> {zoneCounts.accordion}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium">
                                                <EyeOff size={11} /> {zoneCounts.hidden}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product selector */}
                                    <div className="mb-5">
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Configure zones for product:
                                        </label>
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className="w-full md:w-96 bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-orange transition-colors"
                                        >
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Full-width category accordions */}
                                    <div className="space-y-2">
                                        {Object.entries(groupedExtras).map(([cat, items]) => {
                                            const isExpanded = expandedCategories.has(cat);
                                            const catZoneCounts = items.reduce(
                                                (acc, e) => {
                                                    const z = extraZones[e.id] || 'accordion';
                                                    acc[z] = (acc[z] || 0) + 1;
                                                    return acc;
                                                },
                                                {} as Record<string, number>
                                            );
                                            const allPromoted = items.every(e => extraZones[e.id] === 'promoted');
                                            const allAccordion = items.every(e => (extraZones[e.id] || 'accordion') === 'accordion');
                                            const allHidden = items.every(e => extraZones[e.id] === 'hidden');

                                            return (
                                                <div key={cat} className="border border-white/5 rounded-xl bg-background-card overflow-hidden">
                                                    {/* Accordion header */}
                                                    <button
                                                        onClick={() => toggleCategory(cat)}
                                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Wrench size={15} className="text-brand-orange" />
                                                            <span className="font-semibold text-sm text-white">{cat}</span>
                                                            <span className="text-xs text-slate-500 font-medium">({items.length})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {(catZoneCounts['promoted'] || 0) > 0 && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                                                                    {catZoneCounts['promoted']} ⭐
                                                                </span>
                                                            )}
                                                            {(catZoneCounts['hidden'] || 0) > 0 && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
                                                                    {catZoneCounts['hidden']} hidden
                                                                </span>
                                                            )}
                                                            <ChevronDown size={16} className={cn(
                                                                "text-slate-400 transition-transform duration-200",
                                                                isExpanded && "rotate-180"
                                                            )} />
                                                        </div>
                                                    </button>

                                                    {/* Expanded content — list of extras */}
                                                    {isExpanded && (
                                                        <div className="border-t border-white/5">
                                                            {/* Bulk zone buttons for this category */}
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/[0.03]">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Set all:</span>
                                                                <button
                                                                    onClick={() => bulkSetZone(items, 'promoted')}
                                                                    disabled={allPromoted}
                                                                    className={cn(
                                                                        "text-[10px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1",
                                                                        allPromoted
                                                                            ? "border-amber-500/20 text-amber-500/40 cursor-not-allowed"
                                                                            : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                                    )}
                                                                >
                                                                    <Star size={9} /> Promoted
                                                                </button>
                                                                <button
                                                                    onClick={() => bulkSetZone(items, 'accordion')}
                                                                    disabled={allAccordion}
                                                                    className={cn(
                                                                        "text-[10px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1",
                                                                        allAccordion
                                                                            ? "border-blue-500/20 text-blue-500/40 cursor-not-allowed"
                                                                            : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                                    )}
                                                                >
                                                                    <Wrench size={9} /> Accordion
                                                                </button>
                                                                <button
                                                                    onClick={() => bulkSetZone(items, 'hidden')}
                                                                    disabled={allHidden}
                                                                    className={cn(
                                                                        "text-[10px] font-medium px-2.5 py-1 rounded-md border transition-all flex items-center gap-1",
                                                                        allHidden
                                                                            ? "border-slate-500/20 text-slate-500/40 cursor-not-allowed"
                                                                            : "border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                                                                    )}
                                                                >
                                                                    <EyeOff size={9} /> Hidden
                                                                </button>
                                                            </div>
                                                            {items.map((extra, idx) => {
                                                                const zone = extraZones[extra.id] || 'accordion';
                                                                const isHidden = zone === 'hidden';

                                                                return (
                                                                    <div
                                                                        key={extra.id}
                                                                        className={cn(
                                                                            "flex items-center gap-3 px-4 py-2.5 transition-colors group",
                                                                            idx < items.length - 1 && "border-b border-white/[0.03]",
                                                                            isHidden ? "opacity-40" : "hover:bg-white/[0.03]"
                                                                        )}
                                                                    >
                                                                        {/* Extra name — click to open detail popup */}
                                                                        <button
                                                                            onClick={() => setSelectedExtra(extra)}
                                                                            className="flex-1 min-w-0 text-left"
                                                                        >
                                                                            <span className={cn(
                                                                                "text-sm font-medium",
                                                                                isHidden ? "text-slate-500" : "text-white"
                                                                            )}>
                                                                                {extra.name}
                                                                            </span>
                                                                        </button>

                                                                        {/* Price */}
                                                                        <span className="text-xs text-slate-500 font-mono flex-shrink-0 w-16 text-right">
                                                                            ${extra.price}
                                                                        </span>

                                                                        {/* Zone badge — clickable to cycle */}
                                                                        <button
                                                                            onClick={() => cycleZone(extra.id)}
                                                                            title="Click to cycle zone"
                                                                            className="flex-shrink-0"
                                                                        >
                                                                            <ZoneBadge zone={zone} />
                                                                        </button>

                                                                        {/* Quick zone buttons */}
                                                                        <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => setZone(extra.id, 'promoted')}
                                                                                title="Promoted"
                                                                                className={cn(
                                                                                    "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                                                                    zone === 'promoted'
                                                                                        ? "bg-amber-500/20 text-amber-400"
                                                                                        : "text-slate-600 hover:text-amber-400 hover:bg-amber-500/10"
                                                                                )}
                                                                            >
                                                                                <Star size={11} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setZone(extra.id, 'accordion')}
                                                                                title="Accordion"
                                                                                className={cn(
                                                                                    "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                                                                    zone === 'accordion'
                                                                                        ? "bg-blue-500/20 text-blue-400"
                                                                                        : "text-slate-600 hover:text-blue-400 hover:bg-blue-500/10"
                                                                                )}
                                                                            >
                                                                                <Wrench size={11} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setZone(extra.id, 'hidden')}
                                                                                title="Hidden"
                                                                                className={cn(
                                                                                    "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                                                                    zone === 'hidden'
                                                                                        ? "bg-slate-500/20 text-slate-400"
                                                                                        : "text-slate-600 hover:text-slate-400 hover:bg-slate-500/10"
                                                                                )}
                                                                            >
                                                                                <EyeOff size={11} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {products.length === 0 && fabrics.length === 0 && priceGroups.length === 0 && extras.length === 0 && (
                                <div className="text-center text-slate-400 py-12">
                                    No configurable items found for this category.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-white/5 bg-background-card flex justify-end shrink-0 rounded-b-2xl">
                    <button
                        onClick={handleDone}
                        disabled={saving}
                        className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Done
                    </button>
                </div>
            </div>

            {/* Extra detail popup */}
            {renderExtraPopup()}
        </div>
    );
}
