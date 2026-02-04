import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product, Fabric, PriceGroup, ProductExtra } from '../../quoting/types';
import { X, Check, Loader2, Save } from 'lucide-react';

interface CategoryConfigurationProps {
    category: string;
    onClose: () => void;
}

export function CategoryConfiguration({ category, onClose }: CategoryConfigurationProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [category]);

    const fetchData = async () => {
        setLoading(true);
        // Products
        const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('name');

        if (productsData) setProducts(productsData);

        // Fabrics (filter by product_category match or specific category logic if needed)
        // Note: Fabrics often map to product_category string
        const { data: fabricsData } = await supabase
            .from('fabrics')
            .select('*')
            .eq('product_category', category)
            .order('brand, name');

        if (fabricsData) setFabrics(fabricsData);

        // Price Groups
        const { data: groupsData } = await supabase
            .from('price_groups')
            .select('*')
            .eq('category', category)
            .order('group_name');

        if (groupsData) setPriceGroups(groupsData);

        // Extras
        const { data: extrasData } = await supabase
            .from('product_extras')
            .select('*')
            .or(`product_category.eq.${category},product_category.eq.General`)
            .order('name');

        if (extrasData) setExtras(extrasData);

        setLoading(false);
    };

    const toggleActive = async (table: 'products' | 'fabrics' | 'price_groups' | 'product_extras', id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic UI update
        if (table === 'products') setProducts(products.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
        if (table === 'fabrics') setFabrics(fabrics.map(f => f.id === id ? { ...f, is_active: newStatus } : f));
        if (table === 'price_groups') setPriceGroups(priceGroups.map(g => g.id === id ? { ...g, is_active: newStatus } : g));
        if (table === 'product_extras') setExtras(extras.map(e => e.id === id ? { ...e, is_active: newStatus } : e));

        // DB Update
        const { error } = await supabase
            .from(table)
            .update({ is_active: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            // Revert on error would be ideal here, but simpler for now to just log.
            alert('Failed to update status. Please try again.');
        }
    };

    const renderSection = (title: string, items: any[], table: 'products' | 'fabrics' | 'price_groups' | 'product_extras', nameKey: string = 'name') => {
        if (items.length === 0) return null;
        return (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                    {title} ({items.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(item => {
                        const isActive = item.is_active !== false; // Default true
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleActive(table, item.id, isActive)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${isActive
                                        ? 'bg-brand-orange/10 border-brand-orange/30 hover:bg-brand-orange/20'
                                        : 'bg-background-card border-white/5 hover:border-white/10 opacity-60'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-brand-orange-light text-white' : 'bg-white/10 text-transparent'
                                    }`}>
                                    <Check size={14} className="font-bold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a24] w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a24] shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            Configure {category}
                        </h2>
                        <p className="text-slate-300 mt-1">
                            Toggle visibility of products, fabrics, and options in the Quoting Tool.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-brand-orange" size={40} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {renderSection('Products / Models', products, 'products')}
                            {renderSection('Price Groups', priceGroups, 'price_groups', 'group_name')}
                            {renderSection('Fabrics', fabrics, 'fabrics')}
                            {renderSection('Extras & Components', extras, 'product_extras')}

                            {products.length === 0 && fabrics.length === 0 && priceGroups.length === 0 && extras.length === 0 && (
                                <div className="text-center text-slate-400 py-12">
                                    No configurable items found for this category.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 py-5 border-t border-white/5 bg-background-card flex justify-end shrink-0 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl transition-colors font-medium flex items-center gap-2">
                        <Save size={18} />
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
