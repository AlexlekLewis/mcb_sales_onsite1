import React from 'react';
import { X, Calculator, Table, Ruler, AlertCircle } from 'lucide-react';
import { Product } from '../../quoting/types';
import { PRICING_TYPES, PRODUCT_CATEGORIES } from '../../../lib/constants';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';

interface ProductPricingExplainerProps {
    product: Product | null;
    onClose: () => void;
}

export function ProductPricingExplainer({ product, onClose }: ProductPricingExplainerProps) {
    if (!product) return null;

    const renderContent = () => {
        const { pricing_type, category, pricing_data } = product;

        if (!pricing_data && pricing_type !== PRICING_TYPES.UNIT) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300">
                    <AlertCircle size={48} className="mb-4 text-red-400" />
                    <p>No pricing data available for this product.</p>
                </div>
            );
        }

        // Logic 1: Curtains
        if (pricing_type === PRICING_TYPES.GRID && category === PRODUCT_CATEGORIES.CURTAINS) {
            const data = pricing_data as unknown as import('../../quoting/types').GridPricingData;
            const { width_steps, drop_steps } = data || {};
            return (
                <div className="space-y-6">
                    <div className="bg-brand-orange-light/10 p-4 rounded-xl border border-brand-orange/20">
                        <h3 className="text-lg font-semibold text-brand-orange-light flex items-center gap-2 mb-2">
                            <Table size={20} />
                            Curtain Grid Pricing
                        </h3>
                        <p className="text-slate-200 leading-relaxed">
                            This product is priced using a <strong>Drop-Major</strong> grid system.
                            This means the system first locates the correct row based on the <strong>Drop</strong>, and then finds the price in the column corresponding to the <strong>Width</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1a1a24] p-4 rounded-xl">
                            <h4 className="text-sm uppercase text-slate-400 font-bold mb-2">Key Inputs</h4>
                            <ul className="list-disc list-inside text-slate-200 space-y-1">
                                <li><strong>Price Group:</strong> Determines the base grid.</li>
                                <li><strong>Fullness:</strong> Selects between 100% or 160% fullness grids.</li>
                                <li><strong>Width & Drop:</strong> Used to lookup the cell.</li>
                            </ul>
                        </div>
                        <div className="bg-[#1a1a24] p-4 rounded-xl">
                            <h4 className="text-sm uppercase text-slate-400 font-bold mb-2">Grid Dimensions</h4>
                            <div className="text-slate-200 text-sm">
                                <p><strong>Max Width:</strong> {width_steps?.[width_steps.length - 1]}mm</p>
                                <p><strong>Max Drop:</strong> {drop_steps?.[drop_steps.length - 1]}mm</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Logic 2: External Blinds
        if (pricing_type === PRICING_TYPES.GRID && category === PRODUCT_CATEGORIES.EXTERNAL_BLINDS) {
            const data = pricing_data as unknown as import('../../quoting/types').GridPricingData;
            const { width_steps, drop_steps } = data || {};
            return (
                <div className="space-y-6">
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                        <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2 mb-2">
                            <Table size={20} />
                            External Blind Grid Pricing
                        </h3>
                        <p className="text-slate-200 leading-relaxed">
                            This product uses a special <strong>Drop-Major</strong> grid.
                            Prices are stored in rows (Drop) and columns (Width).
                            Unlike standard blinds, the primary lookup is the Drop.
                        </p>
                    </div>

                    <div className="bg-[#1a1a24] p-4 rounded-xl">
                        <h4 className="text-sm uppercase text-slate-400 font-bold mb-2">Calculation Logic</h4>
                        <p className="text-slate-200 mb-2">
                            <code>Final Price = Grid Price × Group Multiplier</code>
                        </p>
                        <ul className="list-disc list-inside text-slate-200 text-sm space-y-1">
                            <li><strong>Grid Price:</strong> Lookup [Drop Index][Width Index].</li>
                            <li><strong>Multiplier:</strong> Taken from the selected Price Group (or 1.0 if default).</li>
                        </ul>
                    </div>

                    {width_steps && drop_steps && (
                        <div className="text-xs text-slate-400 mt-2">
                            Grid Size: {width_steps.length} Widths × {drop_steps.length} Drops
                        </div>
                    )}
                </div>
            );
        }

        // Logic 3: Standard Grid (Roller Blinds, etc.)
        if (pricing_type === PRICING_TYPES.GRID) {
            const data = pricing_data as unknown as import('../../quoting/types').GridPricingData;
            const { width_steps, drop_steps } = data || {};
            return (
                <div className="space-y-6">
                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                        <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2 mb-2">
                            <Table size={20} />
                            Standard Grid Pricing
                        </h3>
                        <p className="text-slate-200 leading-relaxed">
                            This is the standard pricing model for most blinds (e.g., Roller Blinds).
                            It uses a <strong>Width-Major</strong> grid system.
                            The system finds the correct column (Width) first, then the row (Drop).
                        </p>
                    </div>

                    <div className="bg-[#1a1a24] p-4 rounded-xl">
                        <h4 className="text-sm uppercase text-slate-400 font-bold mb-2">Calculation Logic</h4>
                        <p className="text-slate-200 mb-2">
                            <code>Final Price = Grid Price × Group Multiplier</code>
                        </p>
                        <ul className="list-disc list-inside text-slate-200 text-sm space-y-1">
                            <li><strong>Grid Price:</strong> Lookup [Width Index][Drop Index].</li>
                            <li><strong>Multiplier:</strong> Taken from the selected Price Group.</li>
                        </ul>
                    </div>
                </div>
            );
        }

        // Logic 4: SQM
        if (pricing_type === PRICING_TYPES.SQM) {
            const data = pricing_data as unknown as import('../../quoting/types').SqmPricingData;
            const basePrice = data?.price_per_sqm || 0;
            return (
                <div className="space-y-6">
                    <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2 mb-2">
                            <Calculator size={20} />
                            Square Meter (SQM) Pricing
                        </h3>
                        <p className="text-slate-200 leading-relaxed">
                            This product is priced based purely on its area. There are no grids involved.
                        </p>
                    </div>

                    <div className="bg-[#1a1a24] p-4 rounded-xl">
                        <h4 className="text-sm uppercase text-slate-400 font-bold mb-2">Formula</h4>
                        <div className="bg-black/30 p-3 rounded-lg font-mono text-sm text-yellow-500 mb-3">
                            (Width / 1000) × (Drop / 1000) × Base Rate × Multiplier
                        </div>
                        <ul className="list-disc list-inside text-slate-200 text-sm space-y-1">
                            <li><strong>Base Rate:</strong> ${basePrice.toFixed(2)} per sqm</li>
                            <li><strong>Multiplier:</strong> From Price Group</li>
                        </ul>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 bg-gray-800 text-slate-200 rounded-xl">
                Unknown pricing logic.
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-background-card w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#1a1a24]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Ruler className="text-brand-orange" />
                            {product.name}
                        </h2>
                        <p className="text-sm text-slate-300">Pricing Breakdown</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <ErrorBoundary fallback={<div className="p-4 text-red-400">Error loading pricing data.</div>}>
                        {renderContent()}
                    </ErrorBoundary>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-[#1a1a24] flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
