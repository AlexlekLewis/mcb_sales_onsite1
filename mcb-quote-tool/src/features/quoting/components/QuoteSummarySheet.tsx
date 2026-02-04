import React from 'react';
import { ChevronUp, ChevronDown, FileDown, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

interface QuoteLineItem {
    id: string;
    category: string;
    room: string;
    product: string;
    width: number;
    height: number;
    fabric?: string;
    install?: boolean;
    price: number;
}

interface QuoteSummarySheetProps {
    isExpanded: boolean;
    onToggle: () => void;
    quoteItems: QuoteLineItem[];
    totalAmount: number;
}

// Group items by category
function groupByCategory(items: QuoteLineItem[]): Record<string, QuoteLineItem[]> {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, QuoteLineItem[]>);
}

export function QuoteSummarySheet({ isExpanded, onToggle, quoteItems, totalAmount }: QuoteSummarySheetProps) {
    const groupedItems = groupByCategory(quoteItems);
    const categories = Object.keys(groupedItems);

    return (
        <div className="fixed bottom-0 left-16 right-0 z-30">
            {/* Collapsed Tab */}
            <button
                onClick={onToggle}
                className={cn(
                    "w-full flex items-center justify-between px-6 py-4 bg-[#0f1117] border-t border-subtle transition-all",
                    isExpanded ? "rounded-t-xl" : ""
                )}
            >
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white">
                        Total Quote: <span className="text-brand-orange">${totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                    </span>
                    <span className="text-sm text-slate-400">
                        {quoteItems.length} item{quoteItems.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-sm">{isExpanded ? 'Collapse' : 'Expand'}</span>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </div>
            </button>

            {/* Expanded Sheet */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-[#0f1117] border-t border-subtle overflow-hidden"
                    >
                        <div className="max-h-[50vh] overflow-y-auto p-6">
                            {categories.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">
                                    <p>No items in quote yet</p>
                                    <p className="text-sm mt-1">Add products using the tabs above</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {categories.map(category => {
                                        const items = groupedItems[category];
                                        const subtotal = items.reduce((sum, item) => sum + item.price, 0);

                                        return (
                                            <div key={category}>
                                                {/* Category Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-sm font-semibold text-brand-orange uppercase tracking-wider">
                                                        {category} ({items.length})
                                                    </h3>
                                                    <span className="text-sm font-semibold text-white">
                                                        ${subtotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>

                                                {/* Line Items Table */}
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-slate-400 text-xs uppercase">
                                                            <th className="text-left py-2 font-medium">Room</th>
                                                            <th className="text-left py-2 font-medium">Product</th>
                                                            <th className="text-left py-2 font-medium">Size</th>
                                                            <th className="text-left py-2 font-medium">Fabric</th>
                                                            <th className="text-center py-2 font-medium">Install</th>
                                                            <th className="text-right py-2 font-medium">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.map(item => (
                                                            <tr key={item.id} className="border-t border-white/5 text-white">
                                                                <td className="py-3">{item.room}</td>
                                                                <td className="py-3">{item.product}</td>
                                                                <td className="py-3">{item.width} x {item.height}</td>
                                                                <td className="py-3">{item.fabric || '-'}</td>
                                                                <td className="py-3 text-center">
                                                                    {item.install ? (
                                                                        <span className="text-green-400">✓</span>
                                                                    ) : (
                                                                        <span className="text-slate-500">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 text-right font-medium">${item.price.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer with Actions */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-subtle bg-[#0f1117]">
                            <div className="text-xl font-bold text-white">
                                Grand Total: <span className="text-brand-orange">${totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    leftIcon={<Mail size={18} />}
                                >
                                    Email
                                </Button>
                                <Button
                                    variant="primary"
                                    leftIcon={<FileDown size={18} />}
                                >
                                    Generate Quote
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
