import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
    Percent,
    ChevronDown,
    ChevronRight,
    Save,
    Building2,
    Package,
    AlertCircle,
    Check,
    X
} from 'lucide-react';

interface SupplierDiscount {
    id: string;
    supplier: string;
    default_discount_percentage: number;
    notes: string | null;
}

interface Product {
    id: string;
    name: string;
    category: string;
    supplier: string;
    cost_discount_percentage: number | null;
    use_supplier_discount: boolean;
}

interface PriceGroup {
    id: string;
    supplier: string;
    group_code: string;
    group_name: string;
    category: string | null;
    discount_percentage: number | null;
}

interface ProductExtra {
    id: string;
    product_category: string;
    name: string;
    is_nett: boolean;
    extra_category: string | null;
}

export function DiscountManager() {
    const [supplierDiscounts, setSupplierDiscounts] = useState<SupplierDiscount[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'suppliers' | 'products' | 'extras'>('suppliers');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [suppliersRes, productsRes, priceGroupsRes, extrasRes] = await Promise.all([
                supabase.from('supplier_discounts').select('*').order('supplier'),
                supabase.from('products').select('id, name, category, supplier, cost_discount_percentage, use_supplier_discount').order('supplier, category, name'),
                supabase.from('price_groups').select('*').order('supplier, category, group_name'),
                supabase.from('product_extras').select('id, product_category, name, is_nett, extra_category').order('product_category, extra_category, name')
            ]);

            if (suppliersRes.data) setSupplierDiscounts(suppliersRes.data);
            if (productsRes.data) setProducts(productsRes.data);
            if (priceGroupsRes.data) setPriceGroups(priceGroupsRes.data);
            if (extrasRes.data) setExtras(extrasRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    }

    async function updateSupplierDiscount(id: string, discount: number) {
        setSaving(id);
        try {
            const { error } = await supabase
                .from('supplier_discounts')
                .update({ default_discount_percentage: discount, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setSupplierDiscounts(prev =>
                prev.map(s => s.id === id ? { ...s, default_discount_percentage: discount } : s)
            );
            showSuccess('Supplier discount updated');
        } catch (error) {
            console.error('Error updating supplier discount:', error);
        }
        setSaving(null);
    }

    async function updateProductDiscount(id: string, discount: number | null, useSupplierDiscount: boolean) {
        setSaving(id);
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    cost_discount_percentage: discount,
                    use_supplier_discount: useSupplierDiscount
                })
                .eq('id', id);

            if (error) throw error;

            setProducts(prev =>
                prev.map(p => p.id === id ? { ...p, cost_discount_percentage: discount, use_supplier_discount: useSupplierDiscount } : p)
            );
            showSuccess('Product discount updated');
        } catch (error) {
            console.error('Error updating product discount:', error);
        }
        setSaving(null);
    }

    async function updatePriceGroupDiscount(id: string, discount: number | null) {
        setSaving(id);
        try {
            const { error } = await supabase
                .from('price_groups')
                .update({ discount_percentage: discount })
                .eq('id', id);

            if (error) throw error;

            setPriceGroups(prev =>
                prev.map(pg => pg.id === id ? { ...pg, discount_percentage: discount } : pg)
            );
            showSuccess('Price group discount updated');
        } catch (error) {
            console.error('Error updating price group discount:', error);
        }
        setSaving(null);
    }

    async function updateExtraNett(id: string, isNett: boolean) {
        setSaving(id);
        try {
            const { error } = await supabase
                .from('product_extras')
                .update({ is_nett: isNett })
                .eq('id', id);

            if (error) throw error;

            setExtras(prev =>
                prev.map(e => e.id === id ? { ...e, is_nett: isNett } : e)
            );
            showSuccess(isNett ? 'Extra marked as NETT (no discount)' : 'Extra will now receive discounts');
        } catch (error) {
            console.error('Error updating extra:', error);
        }
        setSaving(null);
    }

    function showSuccess(message: string) {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    }

    function toggleSupplier(supplier: string) {
        setExpandedSuppliers(prev => {
            const next = new Set(prev);
            if (next.has(supplier)) {
                next.delete(supplier);
            } else {
                next.add(supplier);
            }
            return next;
        });
    }

    function toggleCategory(category: string) {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }

    function getEffectiveDiscount(product: Product): number {
        if (!product.use_supplier_discount && product.cost_discount_percentage !== null) {
            return product.cost_discount_percentage;
        }
        const supplierDiscount = supplierDiscounts.find(s => s.supplier === product.supplier);
        return supplierDiscount?.default_discount_percentage ?? 0;
    }

    // Group products by supplier then category
    const productsBySupplier = products.reduce((acc, product) => {
        if (!acc[product.supplier]) {
            acc[product.supplier] = {};
        }
        if (!acc[product.supplier][product.category]) {
            acc[product.supplier][product.category] = [];
        }
        acc[product.supplier][product.category].push(product);
        return acc;
    }, {} as Record<string, Record<string, Product[]>>);

    // Group extras by category
    const extrasByCategory = extras.reduce((acc, extra) => {
        const cat = extra.extra_category || 'General';
        if (!acc[extra.product_category]) {
            acc[extra.product_category] = {};
        }
        if (!acc[extra.product_category][cat]) {
            acc[extra.product_category][cat] = [];
        }
        acc[extra.product_category][cat].push(extra);
        return acc;
    }, {} as Record<string, Record<string, ProductExtra[]>>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Percent className="text-brand-orange" />
                    Discount Management
                </h1>
                <p className="text-slate-300 mt-2">
                    Configure the discounts you receive from suppliers. These discounts are applied to calculate your cost price.
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                    <Check className="text-green-400" size={20} />
                    <span className="text-green-400">{successMessage}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'suppliers'
                            ? 'bg-brand-orange text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <Building2 size={18} className="inline mr-2" />
                    Suppliers
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'products'
                            ? 'bg-brand-orange text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <Package size={18} className="inline mr-2" />
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('extras')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'extras'
                            ? 'bg-brand-orange text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                >
                    <AlertCircle size={18} className="inline mr-2" />
                    NETT Items
                </button>
            </div>

            {/* Supplier Discounts Tab */}
            {activeTab === 'suppliers' && (
                <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-400 mt-0.5" size={20} />
                            <div>
                                <p className="text-amber-200 font-medium">How Supplier Discounts Work</p>
                                <p className="text-amber-200/70 text-sm mt-1">
                                    Set the default discount percentage you receive from each supplier.
                                    This discount is applied to list prices to calculate your actual cost price.
                                    Individual products can override this if needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {supplierDiscounts.map(supplier => (
                            <SupplierCard
                                key={supplier.id}
                                supplier={supplier}
                                productCount={products.filter(p => p.supplier === supplier.supplier).length}
                                onUpdate={(discount) => updateSupplierDiscount(supplier.id, discount)}
                                saving={saving === supplier.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-blue-400 mt-0.5" size={20} />
                            <div>
                                <p className="text-blue-200 font-medium">Product-Level Overrides</p>
                                <p className="text-blue-200/70 text-sm mt-1">
                                    By default, products use their supplier's discount. Toggle "Use Supplier Default" off to set a custom discount for specific products.
                                </p>
                            </div>
                        </div>
                    </div>

                    {Object.entries(productsBySupplier).map(([supplier, categories]) => (
                        <div key={supplier} className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => toggleSupplier(supplier)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedSuppliers.has(supplier) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    <Building2 size={20} className="text-brand-orange" />
                                    <span className="font-semibold text-white">{supplier}</span>
                                    <span className="text-slate-400 text-sm">
                                        ({Object.values(categories).flat().length} products)
                                    </span>
                                </div>
                                <span className="text-brand-orange font-medium">
                                    {supplierDiscounts.find(s => s.supplier === supplier)?.default_discount_percentage ?? 0}% default
                                </span>
                            </button>

                            {expandedSuppliers.has(supplier) && (
                                <div className="border-t border-white/5">
                                    {Object.entries(categories).map(([category, categoryProducts]) => (
                                        <div key={category}>
                                            <button
                                                onClick={() => toggleCategory(`${supplier}-${category}`)}
                                                className="w-full px-6 py-3 flex items-center gap-3 bg-white/[0.02] hover:bg-white/5 transition-colors"
                                            >
                                                {expandedCategories.has(`${supplier}-${category}`) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                <span className="text-slate-200">{category}</span>
                                                <span className="text-slate-400 text-sm">({categoryProducts.length})</span>
                                            </button>

                                            {expandedCategories.has(`${supplier}-${category}`) && (
                                                <div className="bg-black/20">
                                                    {categoryProducts.map(product => (
                                                        <ProductRow
                                                            key={product.id}
                                                            product={product}
                                                            supplierDiscount={supplierDiscounts.find(s => s.supplier === product.supplier)?.default_discount_percentage ?? 0}
                                                            effectiveDiscount={getEffectiveDiscount(product)}
                                                            onUpdate={(discount, useSup) => updateProductDiscount(product.id, discount, useSup)}
                                                            saving={saving === product.id}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Extras/NETT Tab */}
            {activeTab === 'extras' && (
                <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-purple-400 mt-0.5" size={20} />
                            <div>
                                <p className="text-purple-200 font-medium">NETT Pricing Items</p>
                                <p className="text-purple-200/70 text-sm mt-1">
                                    Mark items as "NETT" if they should not receive any discount (e.g., motors, controls, accessories).
                                    NETT items are charged at list price.
                                </p>
                            </div>
                        </div>
                    </div>

                    {Object.entries(extrasByCategory).map(([productCategory, subCategories]) => (
                        <div key={productCategory} className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => toggleCategory(productCategory)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedCategories.has(productCategory) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    <Package size={20} className="text-purple-400" />
                                    <span className="font-semibold text-white">{productCategory}</span>
                                    <span className="text-slate-400 text-sm">
                                        ({Object.values(subCategories).flat().length} items)
                                    </span>
                                </div>
                            </button>

                            {expandedCategories.has(productCategory) && (
                                <div className="border-t border-white/5 divide-y divide-white/5">
                                    {Object.entries(subCategories).map(([subCat, items]) => (
                                        <div key={subCat} className="px-6 py-3">
                                            <p className="text-slate-300 text-sm mb-2">{subCat}</p>
                                            <div className="grid gap-2">
                                                {items.map(extra => (
                                                    <div
                                                        key={extra.id}
                                                        className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg"
                                                    >
                                                        <span className="text-slate-200">{extra.name}</span>
                                                        <button
                                                            onClick={() => updateExtraNett(extra.id, !extra.is_nett)}
                                                            disabled={saving === extra.id}
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${extra.is_nett
                                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {saving === extra.id ? '...' : extra.is_nett ? 'NETT' : 'Discountable'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Supplier Card Component
function SupplierCard({
    supplier,
    productCount,
    onUpdate,
    saving
}: {
    supplier: SupplierDiscount;
    productCount: number;
    onUpdate: (discount: number) => void;
    saving: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(supplier.default_discount_percentage.toString());

    function handleSave() {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            onUpdate(numValue);
            setEditing(false);
        }
    }

    return (
        <div className="bg-[#1a1a24] rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange-light/20 flex items-center justify-center">
                        <Building2 className="text-brand-orange" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{supplier.supplier}</h3>
                        <p className="text-slate-400 text-sm">{productCount} products</p>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="text-slate-300 text-sm block mb-2">Default Discount</label>
                {editing ? (
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white pr-8 focus:outline-none focus:border-brand-orange"
                                min="0"
                                max="100"
                                step="0.5"
                                autoFocus
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">%</span>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-2 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            onClick={() => {
                                setValue(supplier.default_discount_percentage.toString());
                                setEditing(false);
                            }}
                            className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="w-full text-left bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white hover:border-brand-orange/50 transition-colors"
                    >
                        <span className="text-2xl font-bold text-brand-orange">{supplier.default_discount_percentage}%</span>
                    </button>
                )}
            </div>

            {supplier.notes && (
                <p className="text-slate-400 text-sm">{supplier.notes}</p>
            )}
        </div>
    );
}

// Product Row Component
function ProductRow({
    product,
    supplierDiscount,
    effectiveDiscount,
    onUpdate,
    saving
}: {
    product: Product;
    supplierDiscount: number;
    effectiveDiscount: number;
    onUpdate: (discount: number | null, useSupplierDiscount: boolean) => void;
    saving: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(product.cost_discount_percentage?.toString() ?? '');
    const [useSupplier, setUseSupplier] = useState(product.use_supplier_discount);

    function handleSave() {
        if (useSupplier) {
            onUpdate(null, true);
        } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                onUpdate(numValue, false);
            }
        }
        setEditing(false);
    }

    return (
        <div className="px-6 py-3 flex items-center justify-between border-b border-white/5 last:border-0">
            <span className="text-slate-200">{product.name}</span>
            <div className="flex items-center gap-4">
                {editing ? (
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={useSupplier}
                                onChange={(e) => setUseSupplier(e.target.checked)}
                                className="rounded border-gray-600"
                            />
                            Use Default
                        </label>
                        {!useSupplier && (
                            <div className="relative">
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-20 bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-sm pr-6 focus:outline-none focus:border-brand-orange"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 text-sm">%</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-1 bg-green-500/20 rounded text-green-400 hover:bg-green-500/30"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            onClick={() => {
                                setValue(product.cost_discount_percentage?.toString() ?? '');
                                setUseSupplier(product.use_supplier_discount);
                                setEditing(false);
                            }}
                            className="p-1 bg-red-500/20 rounded text-red-400 hover:bg-red-500/30"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 text-sm"
                    >
                        <span className={`font-medium ${product.use_supplier_discount ? 'text-slate-300' : 'text-brand-orange'}`}>
                            {effectiveDiscount}%
                        </span>
                        {product.use_supplier_discount && (
                            <span className="text-slate-400 text-xs">(supplier default)</span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
