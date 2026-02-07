import React, { useState, useEffect } from 'react';
import { GripVertical, Check, Eye, EyeOff, Save } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { supabase } from '../../../lib/supabase';

interface QuoteSummaryColumn {
    key: string;
    label: string;
    visible: boolean;
    order: number;
}

interface CategorySettings {
    category: string;
    columns: QuoteSummaryColumn[];
}

// Default columns available for all categories
const DEFAULT_COLUMNS: Omit<QuoteSummaryColumn, 'order'>[] = [
    { key: 'room', label: 'Room/Location', visible: true },
    { key: 'product', label: 'Product', visible: true },
    { key: 'width', label: 'Width', visible: true },
    { key: 'height', label: 'Height', visible: true },
    { key: 'fabric', label: 'Fabric', visible: true },
    { key: 'pelmet_color', label: 'Pelmet Color', visible: false },
    { key: 'bottom_rail', label: 'Bottom Rail', visible: false },
    { key: 'chain_color', label: 'Chain/Cord Color', visible: false },
    { key: 'installation', label: 'Installation', visible: true },
    { key: 'extras', label: 'Extras', visible: false },
    { key: 'notes', label: 'Notes', visible: false },
    { key: 'cost_price', label: 'Cost Price', visible: false },
    { key: 'margin', label: 'Margin %', visible: false },
    { key: 'sell_price', label: 'Sell Price', visible: true },
];

const PRODUCT_CATEGORIES = [
    'External Blinds',
    'Internal Blinds',
    'Curtains',
    'Plantation Shutters',
    'Security Doors',
];

export function QuoteSummarySettings() {
    const [selectedCategory, setSelectedCategory] = useState(PRODUCT_CATEGORIES[0]);
    const [settings, setSettings] = useState<CategorySettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Initialize with defaults or fetch from database
    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);

            const { data, error } = await supabase
                .from('quote_summary_settings')
                .select('*');

            if (data && data.length > 0) {
                setSettings(data.map(d => ({
                    category: d.category,
                    columns: d.columns as QuoteSummaryColumn[]
                })));
            } else {
                // Initialize with defaults for each category
                const defaults = PRODUCT_CATEGORIES.map(category => ({
                    category,
                    columns: DEFAULT_COLUMNS.map((col, idx) => ({ ...col, order: idx }))
                }));
                setSettings(defaults);
            }

            setLoading(false);
        }

        fetchSettings();
    }, []);

    const getCurrentColumns = () => {
        const current = settings.find(s => s.category === selectedCategory);
        if (current) return current.columns.sort((a, b) => a.order - b.order);
        return DEFAULT_COLUMNS.map((col, idx) => ({ ...col, order: idx }));
    };

    const updateColumnVisibility = (key: string, visible: boolean) => {
        setSettings(prev => prev.map(s => {
            if (s.category !== selectedCategory) return s;
            return {
                ...s,
                columns: s.columns.map(c =>
                    c.key === key ? { ...c, visible } : c
                )
            };
        }));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const columns = [...getCurrentColumns()];
        const [removed] = columns.splice(draggedIndex, 1);
        columns.splice(index, 0, removed);

        // Update orders
        const reordered = columns.map((col, idx) => ({ ...col, order: idx }));

        setSettings(prev => prev.map(s => {
            if (s.category !== selectedCategory) return s;
            return { ...s, columns: reordered };
        }));

        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = async () => {
        setSaving(true);

        const current = settings.find(s => s.category === selectedCategory);
        if (!current) return;

        // Upsert settings
        const { error } = await supabase
            .from('quote_summary_settings')
            .upsert({
                category: selectedCategory,
                columns: current.columns,
                updated_at: new Date().toISOString()
            }, { onConflict: 'category' });

        if (error) {
            console.error('Failed to save settings:', error);
        }

        setSaving(false);
    };

    const columns = getCurrentColumns();
    const visibleCount = columns.filter(c => c.visible).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quote Summary Settings</h1>
                    <p className="text-slate-400 mt-1">Configure which columns appear in the quote summary for each product category</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange-light disabled:opacity-50 transition-all"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {PRODUCT_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                            selectedCategory === cat
                                ? "bg-brand-orange text-white"
                                : "bg-white/10 text-slate-300 hover:bg-white/20"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Column List */}
            <div className="bg-background-card rounded-xl border border-subtle overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle bg-white/5">
                    <span className="text-sm font-medium text-slate-400">
                        {visibleCount} of {columns.length} columns visible
                    </span>
                    <span className="text-xs text-slate-500">Drag to reorder</span>
                </div>

                <div className="divide-y divide-white/5">
                    {columns.map((column, index) => (
                        <div
                            key={column.key}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 cursor-move transition-all",
                                draggedIndex === index ? "bg-brand-orange/20" : "hover:bg-white/5"
                            )}
                        >
                            <GripVertical size={18} className="text-slate-500 flex-shrink-0" />
                            <span className={cn(
                                "flex-1 font-medium",
                                column.visible ? "text-white" : "text-slate-500"
                            )}>
                                {column.label}
                            </span>
                            <button
                                onClick={() => updateColumnVisibility(column.key, !column.visible)}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    column.visible
                                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                        : "bg-white/5 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                {column.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview</h3>
                <div className="bg-background-card rounded-xl border border-subtle overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-subtle">
                                {columns.filter(c => c.visible).map(col => (
                                    <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-brand-orange uppercase">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-slate-400">
                                {columns.filter(c => c.visible).map(col => (
                                    <td key={col.key} className="px-4 py-3">
                                        Sample data
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
