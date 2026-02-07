import React from 'react';
import { Check, ChevronDown, Wrench, Info, Search, X } from 'lucide-react';
import { Product, PriceGroup, Fabric, SelectedExtra, ProductExtra } from '../types';
import { cn } from '../../../lib/utils';
import { FabricSelector } from './FabricSelector';

// Reusing types from hook/component structure
interface ProductConfiguratorProps {
    tabs: { id: string; label: string; supplier: string; category: string }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;

    products: Product[];
    selectedProductId: string;
    onProductChange: (id: string) => void;

    fabrics: Fabric[];
    selectedFabricId: string;
    onFabricChange: (id: string) => void;

    priceGroups: PriceGroup[];
    selectedPriceGroup: PriceGroup | null;
    onSelectedPriceGroupChange: (group: PriceGroup | null) => void; // Fixed signature

    extras: ProductExtra[];
    selectedExtras: SelectedExtra[];
    onToggleExtra: (extra: ProductExtra) => void;

    formState: {
        width: string;
        drop: string;
        quantity: string;
        fullness: '100' | '160';
    };
    onFormChange: (field: string, value: any) => void;

    onAdd: () => void;
    isValid: boolean;
    livePrice?: number;
    liveWarning?: string;  // Actual errors that block adding
    liveNote?: string;     // Informational (pricing tier used)
    addRangeButton?: React.ReactNode; // "+" tab for adding product ranges
}

export function ProductConfigurator({
    tabs, activeTab, onTabChange,
    products, selectedProductId, onProductChange,
    fabrics, selectedFabricId, onFabricChange,
    priceGroups, selectedPriceGroup, onSelectedPriceGroupChange,
    extras, selectedExtras, onToggleExtra,
    formState, onFormChange,
    onAdd, isValid, livePrice, liveWarning, liveNote,
    addRangeButton
}: ProductConfiguratorProps) {

    const selectedProduct = products.find(p => p.id === selectedProductId);

    // State for expanded extra categories
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(['General', 'Motorisation']));

    // Helper determines visibility
    const quoteConfig = selectedProduct?.quote_config || {};
    const showWidth = quoteConfig.show_width ?? true;
    const showDrop = quoteConfig.show_drop ?? true;
    const showFullness = quoteConfig.show_fullness ?? (selectedProduct?.category === 'Curtains');

    // Derived state
    const isProductSelected = !!selectedProductId;

    // Group Extras
    const groupedExtras = React.useMemo(() => {
        const groups: Record<string, ProductExtra[]> = {};
        extras.forEach(extra => {
            const cat = extra.extra_category || 'General Accesssories';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(extra);
        });
        return groups;
    }, [extras]);

    const toggleCategory = (cat: string) => {
        const next = new Set(expandedCategories);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        setExpandedCategories(next);
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto px-6 py-4 custom-scrollbar bg-background">
            {/* 1. Category Tabs - Always Visible */}
            <div className="flex-shrink-0 mb-6 border-b border-white/5">
                <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "px-6 py-3 rounded-t-xl text-sm font-medium transition-all duration-200 border-t border-x border-b-0 relative top-[1px] whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-background-card border-white/10 text-brand-orange z-10"
                                    : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-orange" />
                            )}
                        </button>
                    ))}
                    {addRangeButton}
                </div>
            </div>

            <div className="flex-1 space-y-8 max-w-3xl mx-auto w-full">
                {/* 2. Product Selection Grid */}
                {!isProductSelected ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select Product</h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => onProductChange(product.id)}
                                    className="group relative flex flex-col items-start p-5 rounded-2xl bg-background-card border border-white/5 hover:border-brand-orange/50 hover:bg-white/5 transition-all duration-300 text-left"
                                >
                                    <span className="font-bold text-white text-lg mb-1 group-hover:text-brand-orange transition-colors">{product.name}</span>
                                    <span className="text-xs text-slate-500">Select to configure</span>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-orange">
                                        <ChevronDown className="-rotate-90" size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // 3. Configuration View (When Product Selected)
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        {/* Selected Product Header / Change Button */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedProduct?.name}</h2>
                                <p className="text-brand-orange text-sm font-medium mt-1">Configuration</p>
                            </div>
                            <button
                                onClick={() => onProductChange('')}
                                className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 text-sm hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                            >
                                Change Product
                            </button>
                        </div>

                        {/* Dimensions & Config */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Col: Dimensions */}
                                <div className="space-y-6">
                                    {(showWidth || showDrop) && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dimensions (mm)</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {showWidth && (
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            min="0"
                                                            value={formState.width}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (val < 0) return;
                                                                onFormChange('width', e.target.value);
                                                            }}
                                                            className="w-full bg-background-input border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-mono"
                                                            autoFocus
                                                        />
                                                        <span className="absolute right-3 top-3.5 text-xs text-slate-500 pointer-events-none group-focus-within:text-brand-orange">Width</span>
                                                    </div>
                                                )}
                                                {showDrop && (
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            min="0"
                                                            value={formState.drop}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (val < 0) return;
                                                                onFormChange('drop', e.target.value);
                                                            }}
                                                            className="w-full bg-background-input border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-mono"
                                                        />
                                                        <span className="absolute right-3 top-3.5 text-xs text-slate-500 pointer-events-none group-focus-within:text-brand-orange">Drop</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quantity</h3>
                                        <div className="flex items-center gap-4 bg-background-card p-1 rounded-xl w-fit border border-white/5">
                                            <button onClick={() => onFormChange('quantity', Math.max(1, parseInt(formState.quantity || '1') - 1).toString())} className="w-10 h-10 rounded-lg bg-white/5 text-white hover:bg-white/10 hover:text-brand-orange transition-colors font-bold text-lg">-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formState.quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (val < 1 && e.target.value !== '') return; // Allow empty string while typing, check blur/submit
                                                    onFormChange('quantity', e.target.value);
                                                }}
                                                className="w-16 text-center bg-transparent text-xl font-bold text-white focus:outline-none"
                                            />
                                            <button onClick={() => onFormChange('quantity', (parseInt(formState.quantity || '1') + 1).toString())} className="w-10 h-10 rounded-lg bg-white/5 text-white hover:bg-white/10 hover:text-brand-orange transition-colors font-bold text-lg">+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: Details */}
                                <div className="space-y-6">
                                    {showFullness && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fullness Style</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => onFormChange('fullness', '100')}
                                                    className={cn("py-3 px-2 rounded-xl text-sm font-medium border transition-all", formState.fullness === '100' ? "bg-brand-orange/10 border-brand-orange text-brand-orange" : "bg-background-card border-white/5 text-slate-400 hover:text-white")}
                                                >
                                                    Standard (100%)
                                                </button>
                                                <button
                                                    onClick={() => onFormChange('fullness', '160')}
                                                    className={cn("py-3 px-2 rounded-xl text-sm font-medium border transition-all", formState.fullness === '160' ? "bg-brand-orange/10 border-brand-orange text-brand-orange" : "bg-background-card border-white/5 text-slate-400 hover:text-white")}
                                                >
                                                    S-Fold (160%)
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {(fabrics.length > 0 || priceGroups.length > 0) && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Material Selection</h3>
                                            {fabrics.length > 0 ?
                                                <FabricSelector
                                                    fabrics={fabrics}
                                                    selectedFabricId={selectedFabricId}
                                                    onFabricChange={onFabricChange}
                                                    selectedProduct={selectedProduct}
                                                />
                                                : (
                                                    selectedProduct?.category !== 'Plantation Shutters' && (
                                                        <select
                                                            value={selectedPriceGroup?.id || ''}
                                                            onChange={(e) => {
                                                                const group = priceGroups.find(g => g.id === e.target.value);
                                                                onSelectedPriceGroupChange(group || null);
                                                            }}
                                                            className="w-full bg-background-input border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-orange hover:border-white/20 transition-colors"
                                                            disabled={!selectedProduct}
                                                        >
                                                            <option value="">Select Price Group...</option>
                                                            {priceGroups.map(g => (
                                                                <option key={g.id} value={g.id}>{g.group_name} ({g.multiplier}x)</option>
                                                            ))}
                                                        </select>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4. Extras Accordions (Grouped) */}
                            {Object.keys(groupedExtras).length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Extras</h3>

                                    {Object.entries(groupedExtras).map(([category, items]) => {
                                        const isExpanded = expandedCategories.has(category);
                                        const selectedCount = items.filter(i => selectedExtras.some(s => s.id === i.id)).length;

                                        return (
                                            <div key={category} className="border border-white/5 rounded-xl bg-background-card overflow-hidden">
                                                <button
                                                    onClick={() => toggleCategory(category)}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Wrench size={14} className="text-brand-orange" />
                                                        <span className="font-medium text-sm text-white">{category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {selectedCount > 0 && (
                                                            <span className="bg-brand-orange/20 text-brand-orange text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>
                                                        )}
                                                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-3 pb-3 pt-0 grid grid-cols-3 gap-1.5 animate-in slide-in-from-top-2 duration-200 border-t border-white/5">
                                                        {items.map(extra => {
                                                            const isSelected = selectedExtras.some(e => e.id === extra.id);
                                                            return (
                                                                <button
                                                                    key={extra.id}
                                                                    onClick={() => onToggleExtra(extra)}
                                                                    className={cn(
                                                                        "flex items-center gap-2 p-2 rounded-lg text-left border transition-all group",
                                                                        isSelected
                                                                            ? "bg-brand-orange/10 border-brand-orange/50"
                                                                            : "bg-background-input border-white/5 hover:border-white/20"
                                                                    )}
                                                                >
                                                                    <div className={cn("w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors", isSelected ? "bg-brand-orange border-brand-orange" : "border-slate-600 group-hover:border-slate-400")}>
                                                                        {isSelected && <Check size={8} className="text-white" />}
                                                                    </div>
                                                                    <span className={cn("text-[11px] font-medium truncate", isSelected ? "text-white" : "text-slate-300")}>{extra.name}</span>
                                                                    <span className="text-[10px] text-slate-500 font-mono ml-auto flex-shrink-0">${extra.price}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="pt-4 pb-8 space-y-4">
                                {/* Live Price Feedback */}
                                {(livePrice !== undefined || liveWarning || liveNote) && (
                                    <div className={cn(
                                        "p-4 rounded-xl border flex items-center justify-between transition-all duration-300",
                                        liveWarning
                                            ? "bg-red-500/10 border-red-500/50 text-red-400"
                                            : liveNote
                                                ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                                : "bg-background-input border-white/10"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {liveWarning ? <Info size={20} /> : liveNote ? <Info size={20} className="text-blue-400" /> : <span className="text-slate-400">Estimated Price:</span>}
                                            <span className="font-medium text-sm">
                                                {liveWarning || liveNote || 'Ready to add'}
                                            </span>
                                        </div>
                                        <div className={cn("text-2xl font-bold font-mono", liveWarning ? "text-red-500 opacity-50" : "text-white")}>
                                            ${(livePrice || 0).toFixed(2)}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={onAdd}
                                    disabled={!isValid || !!liveWarning}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2",
                                        isValid && !liveWarning
                                            ? "bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-orange-glow hover:shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                                            : "bg-background-card border border-white/5 text-slate-500 cursor-not-allowed"
                                    )}
                                >
                                    <Check size={20} />
                                    Add Item to Quote
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
