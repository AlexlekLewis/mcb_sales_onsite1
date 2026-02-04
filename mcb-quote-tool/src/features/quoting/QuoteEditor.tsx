import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Quote, QuoteItemFull, QuoteConfig } from './types';
import {
    calculateMargin,
    applySingleMargin,
    calculateQuoteTotals,
    formatCurrency,
    formatPercent
} from './margin-utils';
import {
    Save,
    Loader2,
    Percent,
    MapPin,
    Trash2,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuoteEditorProps {
    quoteId: string;
    onSave?: () => void;
    readOnly?: boolean;
}

export function QuoteEditor({ quoteId, onSave, readOnly = false }: QuoteEditorProps) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [items, setItems] = useState<QuoteItemFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Margin controls
    const [overallMargin, setOverallMargin] = useState(0);
    const [showGst, setShowGst] = useState(true);
    const [showCategoryMargins, setShowCategoryMargins] = useState(false);
    const [categoryMargins, setCategoryMargins] = useState<Record<string, number>>({});

    // Fetch quote and items
    useEffect(() => {
        async function fetchQuote() {
            if (!quoteId) return;

            const { data: quoteData } = await supabase
                .from('quotes')
                .select('*')
                .eq('id', quoteId)
                .single();

            if (quoteData) {
                setQuote(quoteData);
                setOverallMargin(quoteData.overall_margin_percent || 0);
                setShowGst(quoteData.show_gst ?? true);

                const { data: itemsData } = await supabase
                    .from('quote_items')
                    .select('*, products(name, supplier, category, quote_config)')
                    .eq('quote_id', quoteId);

                if (itemsData) {
                    // Initialize items with default values if missing
                    const processedItems = itemsData.map(item => ({
                        ...item,
                        cost_price: item.cost_price ?? (item.calculated_price / (item.quantity || 1)),
                        item_margin_percent: item.item_margin_percent ?? 0,
                        sell_price: item.sell_price ?? (item.calculated_price / (item.quantity || 1)),
                        location: item.location || ''
                    }));
                    setItems(processedItems);

                    // Extract unique categories for category margin controls
                    const categories = new Set(processedItems.map(i => i.products?.category).filter(Boolean));
                    const initialCategoryMargins: Record<string, number> = {};
                    categories.forEach(cat => {
                        if (cat) initialCategoryMargins[cat] = 0;
                    });
                    setCategoryMargins(initialCategoryMargins);
                }
            }
            setLoading(false);
        }
        fetchQuote();
    }, [quoteId]);

    // Extract unique categories from items
    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.products?.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [items]);

    // Calculate totals
    const totals = useMemo(() => {
        return calculateQuoteTotals(
            items.map(item => ({
                quantity: item.quantity,
                cost_price: item.cost_price,
                item_margin_percent: item.item_margin_percent > 0
                    ? item.item_margin_percent
                    : categoryMargins[item.products?.category || ''] || overallMargin
            })),
            overallMargin,
            categoryMargins
        );
    }, [items, overallMargin, categoryMargins]);

    // Update item field
    const updateItem = (index: number, field: keyof QuoteItemFull, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;

        // Recalculate sell_price and calculated_price when margin changes
        if (field === 'item_margin_percent' || field === 'quantity') {
            const item = newItems[index];
            const effectiveMargin = item.item_margin_percent > 0
                ? item.item_margin_percent
                : categoryMargins[item.products?.category || ''] || overallMargin;
            item.sell_price = applySingleMargin(item.cost_price, effectiveMargin);
            item.calculated_price = item.sell_price * item.quantity;
        }

        setItems(newItems);
        setHasChanges(true);
    };

    // Apply overall margin to all items without individual overrides
    const applyOverallMarginToItems = () => {
        const newItems = items.map(item => {
            if (item.item_margin_percent === 0) {
                const effectiveMargin = categoryMargins[item.products?.category || ''] || overallMargin;
                const sell_price = applySingleMargin(item.cost_price, effectiveMargin);
                return {
                    ...item,
                    sell_price,
                    calculated_price: sell_price * item.quantity
                };
            }
            return item;
        });
        setItems(newItems);
        setHasChanges(true);
    };

    // Effect to recalculate when overall margin changes
    useEffect(() => {
        if (items.length > 0) {
            applyOverallMarginToItems();
        }
    }, [overallMargin, categoryMargins]);

    // Delete item
    const deleteItem = async (index: number) => {
        const item = items[index];
        if (!confirm('Delete this item?')) return;

        await supabase.from('quote_items').delete().eq('id', item.id);
        setItems(items.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    // Save all changes
    const handleSave = async () => {
        if (!quote) return;
        setSaving(true);

        // Update quote
        await supabase.from('quotes').update({
            overall_margin_percent: overallMargin,
            show_gst: showGst,
            total_amount: totals.subtotalExGst
        }).eq('id', quote.id);

        // Update each item
        for (const item of items) {
            await supabase.from('quote_items').update({
                location: item.location,
                cost_price: item.cost_price,
                item_margin_percent: item.item_margin_percent,
                sell_price: item.sell_price,
                calculated_price: item.calculated_price,
                quantity: item.quantity
            }).eq('id', item.id);
        }

        setHasChanges(false);
        setSaving(false);
        onSave?.();
    };

    // Format size helper
    const formatSize = (item: QuoteItemFull) => {
        const config = item.products?.quote_config;
        const sWidth = config?.show_width ?? true;
        const sDrop = config?.show_drop ?? true;
        if (sWidth && sDrop) return `${item.width} × ${item.drop}`;
        if (sWidth) return `${item.width}mm`;
        if (sDrop) return `${item.drop}mm`;
        return '-';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-orange" size={32} />
            </div>
        );
    }

    if (!quote) {
        return <div className="text-center py-20 text-slate-300">Quote not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Margin Controls */}
            <div className="bg-background-card rounded-2xl p-6 border border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Percent size={20} className="text-brand-orange" />
                        Margin Settings
                    </h3>
                    <div className="flex items-center gap-4">
                        {/* GST Toggle */}
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => !readOnly && setShowGst(false)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                                    !showGst ? "bg-brand-orange text-white" : "text-slate-300 hover:text-white"
                                )}
                                disabled={readOnly}
                            >
                                Ex GST
                            </button>
                            <button
                                onClick={() => !readOnly && setShowGst(true)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                                    showGst ? "bg-brand-orange text-white" : "text-slate-300 hover:text-white"
                                )}
                                disabled={readOnly}
                            >
                                Inc GST
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overall Margin Slider */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Overall Margin</label>
                        <span className="text-lg font-bold text-brand-orange">{formatPercent(overallMargin)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={overallMargin}
                            onChange={(e) => {
                                setOverallMargin(parseFloat(e.target.value));
                                setHasChanges(true);
                            }}
                            disabled={readOnly}
                            className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={overallMargin}
                            onChange={(e) => {
                                setOverallMargin(parseFloat(e.target.value) || 0);
                                setHasChanges(true);
                            }}
                            disabled={readOnly}
                            className="w-20 bg-[#1c1c24] border border-white/10 rounded-lg px-3 py-2 text-white text-center"
                        />
                    </div>
                </div>

                {/* Category Margins (Collapsible) */}
                {categories.length > 1 && (
                    <div>
                        <button
                            onClick={() => setShowCategoryMargins(!showCategoryMargins)}
                            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors mb-3"
                        >
                            {showCategoryMargins ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            Category Margins (Optional Overrides)
                        </button>
                        {showCategoryMargins && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white/5 rounded-xl p-4">
                                {categories.map(category => (
                                    <div key={category} className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 block">{category}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={categoryMargins[category] || 0}
                                                onChange={(e) => {
                                                    setCategoryMargins({
                                                        ...categoryMargins,
                                                        [category]: parseFloat(e.target.value) || 0
                                                    });
                                                    setHasChanges(true);
                                                }}
                                                disabled={readOnly}
                                                className="w-full bg-[#1c1c24] border border-white/10 rounded-lg px-3 py-2 text-white text-center text-sm"
                                            />
                                            <span className="text-slate-400 text-sm">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Line Items Table */}
            <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase w-8">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Location</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Product</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Size</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase w-16">Qty</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Cost</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase w-24">Margin</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Sell</th>
                            {!readOnly && <th className="px-4 py-3 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={readOnly ? 8 : 9} className="px-4 py-8 text-center text-slate-400">
                                    No items in this quote
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => {
                                const effectiveMargin = item.item_margin_percent > 0
                                    ? item.item_margin_percent
                                    : categoryMargins[item.products?.category || ''] || overallMargin;
                                const lineSell = applySingleMargin(item.cost_price, effectiveMargin);
                                const lineTotal = lineSell * item.quantity;
                                const displayTotal = showGst ? lineTotal * 1.1 : lineTotal;

                                return (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={item.location || ''}
                                                onChange={(e) => updateItem(index, 'location', e.target.value)}
                                                placeholder="Room..."
                                                disabled={readOnly}
                                                className="w-full bg-transparent border-0 border-b border-transparent hover:border-white/20 focus:border-brand-orange text-white text-sm px-0 py-1 focus:outline-none transition-colors"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {item.products?.supplier} - {item.products?.name}
                                                </p>
                                                {item.item_config?.fabric_name && (
                                                    <p className="text-xs text-slate-400">
                                                        {item.item_config.fabric_name}
                                                        {item.item_config.price_group && ` (${item.item_config.price_group})`}
                                                    </p>
                                                )}
                                                {item.item_config?.extras && item.item_config.extras.length > 0 && (
                                                    <p className="text-xs text-brand-orange">
                                                        + {item.item_config.extras.map(e => e.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">{formatSize(item)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                disabled={readOnly}
                                                className="w-12 bg-[#1c1c24] border border-white/10 rounded px-2 py-1 text-white text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-300 text-sm">
                                            {formatCurrency(item.cost_price)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.item_margin_percent || ''}
                                                    onChange={(e) => updateItem(index, 'item_margin_percent', parseFloat(e.target.value) || 0)}
                                                    placeholder={`${effectiveMargin}`}
                                                    disabled={readOnly}
                                                    className={cn(
                                                        "w-14 bg-[#1c1c24] border rounded px-2 py-1 text-sm text-center",
                                                        item.item_margin_percent > 0
                                                            ? "border-brand-orange/50 text-brand-orange-light"
                                                            : "border-white/10 text-slate-400"
                                                    )}
                                                />
                                                <span className="text-slate-400 text-xs">%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div>
                                                <p className="text-white font-medium text-sm">
                                                    {formatCurrency(displayTotal)}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-slate-400">
                                                        {formatCurrency(showGst ? lineSell * 1.1 : lineSell)} ea
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        {!readOnly && (
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => deleteItem(index)}
                                                    className="text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Totals Footer */}
                {items.length > 0 && (
                    <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="flex justify-end p-6">
                            <div className="w-full max-w-sm space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Items Total (cost)</span>
                                    <span className="text-slate-300">{formatCurrency(totals.totalCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">
                                        Margin Applied ({formatPercent(totals.averageMarginPercent)} avg)
                                    </span>
                                    <span className="text-green-400">+{formatCurrency(totals.totalMargin)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-200">Subtotal (ex GST)</span>
                                        <span className="text-white font-medium">{formatCurrency(totals.subtotalExGst)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">GST (10%)</span>
                                    <span className="text-slate-300">{formatCurrency(totals.gst)}</span>
                                </div>
                                <div className="border-t border-brand-orange/30 pt-3 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-brand-orange-light font-medium">TOTAL (inc GST)</span>
                                        <span className="text-xl font-bold text-brand-orange">{formatCurrency(totals.totalIncGst)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            {!readOnly && hasChanges && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
