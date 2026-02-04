import React, { useState } from 'react';
import { Trash2, Edit2, AlertCircle, ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { EnhancedQuoteItem } from '../types';

interface QuoteSummaryRailProps {
    items: EnhancedQuoteItem[];
    totals: {
        totalSell: number;
        totalMargin: number;
        avgMarginPercent: number;
    };
    overallMargin: number;
    onUpdateMargin: (percent: number) => void;
    onRemoveItem: (id: string) => void;
    onEditItem: (item: EnhancedQuoteItem) => void; // Placeholder for future modal logic
}

export function QuoteSummaryRail({ items, totals, overallMargin, onUpdateMargin, onRemoveItem, onEditItem }: QuoteSummaryRailProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    return (
        <div className="flex flex-col h-full bg-background-card border-l border-white/5">
            {/* Header / Global Controls */}
            <div className="p-4 border-b border-white/5 bg-background-card/50 backdrop-blur sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white mb-3">Current Quote</h3>

                {/* Global Margin Control */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Target Margin</span>
                    <div className="flex items-center gap-2 bg-background-input rounded-lg border border-white/10 p-1">
                        <button
                            onClick={() => onUpdateMargin(overallMargin - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >-</button>
                        <span className="font-mono text-brand-orange w-8 text-center font-bold">{overallMargin}%</span>
                        <button
                            onClick={() => onUpdateMargin(overallMargin + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >+</button>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                        Total Items: {items.reduce((sum, i) => sum + i.quantity, 0)}
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${totals.totalSell.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl bg-white/2">
                        <Calculator size={32} className="mb-2 opacity-50 text-brand-orange" />
                        <p className="text-sm">No items added yet</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const isExpanded = expandedIds.has(item.id);
                        return (
                            <div key={item.id} className="group bg-background-input border border-white/5 rounded-xl transition-all hover:border-brand-orange/30 overflow-hidden">
                                {/* Item Header Row */}
                                <div className="p-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleExpand(item.id)}>
                                    <div className="mt-1 text-slate-400">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-white truncate pr-2">{item.product_name}</h4>
                                            <span className="font-bold text-brand-orange-light whitespace-nowrap">${item.calculated_price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-slate-400 truncate">
                                                {item.width}x{item.drop}mm • Qty {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-1 bg-black/20">
                                        <div className="pt-2 text-xs text-slate-400 space-y-1">
                                            {item.fabric_name && (
                                                <div className="flex justify-between">
                                                    <span>Fabric:</span>
                                                    <span className="text-slate-300">{item.fabric_name}</span>
                                                </div>
                                            )}
                                            {item.price_group && (
                                                <div className="flex justify-between">
                                                    <span>Group:</span>
                                                    <span className="text-slate-300">{item.price_group}</span>
                                                </div>
                                            )}
                                            {item.extras && item.extras.length > 0 && (
                                                <div className="border-t border-white/5 pt-1 mt-1">
                                                    <span className="block mb-1 opacity-70">Extras:</span>
                                                    {item.extras.map(e => (
                                                        <div key={e.id} className="flex justify-between pl-2 border-l-2 border-brand-orange/20 mb-1">
                                                            <span>{e.name}</span>
                                                            <span>${e.calculated_price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                                                    className="flex items-center gap-1.5 px-2 py-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded transition-colors text-xs"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 size={12} /> Remove
                                                </button>
                                                {/* Edit support to come later */}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-background-card/50 text-xs text-center text-slate-500">
                Prices include GST unless specified
            </div>
        </div>
    );
}
