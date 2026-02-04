import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface ProductTab {
    id: string;
    category: string;
    label: string;
}

interface ProductTabBarProps {
    tabs: ProductTab[];
    activeTabId: string | null;
    onTabSelect: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onAddTab: (category: string) => void;
}

const PRODUCT_CATEGORIES = [
    { id: 'external-blinds', label: 'External Blinds', icon: '☀️' },
    { id: 'internal-blinds', label: 'Internal Blinds', icon: '🪟' },
    { id: 'plantation-shutters', label: 'Plantation Shutters', icon: '🏠' },
    { id: 'security-doors', label: 'Security Doors', icon: '🔒' },
];

export function ProductTabBar({ tabs, activeTabId, onTabSelect, onTabClose, onAddTab }: ProductTabBarProps) {
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const handleAddCategory = (category: string) => {
        onAddTab(category);
        setShowCategoryPicker(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-background border-b border-subtle overflow-x-auto no-scrollbar">
                {/* Product Tabs */}
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabSelect(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap group relative overflow-hidden",
                            activeTabId === tab.id
                                ? "text-brand-orange shadow-orange-glow border border-brand-orange/20 bg-brand-orange/5"
                                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent"
                        )}
                    >
                        {activeTabId === tab.id && (
                            <motion.div
                                layoutId="active-product-tab"
                                className="absolute inset-0 bg-brand-orange/10"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabClose(tab.id);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    onTabClose(tab.id);
                                }
                            }}
                            className={cn(
                                "p-0.5 rounded hover:bg-white/20 transition-colors cursor-pointer",
                                activeTabId === tab.id ? "text-brand-orange" : "text-slate-400 opacity-0 group-hover:opacity-100"
                            )}
                        >
                            <X size={14} />
                        </span>
                    </button>
                ))}

                {/* Add Tab Button */}
                <button
                    onClick={() => setShowCategoryPicker(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#D97706,#F59E0B)] text-white hover:brightness-110 transition-all shadow-orange-glow"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Category Picker Modal */}
            <AnimatePresence>
                {showCategoryPicker && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowCategoryPicker(false)}
                        />
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute top-full left-4 mt-2 bg-background-card rounded-xl border border-subtle shadow-2xl p-4 z-50 min-w-[300px]"
                        >
                            <h3 className="text-sm font-semibold text-white mb-3">Select Product Category</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleAddCategory(cat.id)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-brand-orange/20 border border-transparent hover:border-brand-orange/30 transition-all text-center"
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-sm font-medium text-white">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
}
