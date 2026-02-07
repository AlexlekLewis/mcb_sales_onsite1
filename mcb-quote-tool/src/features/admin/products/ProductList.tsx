
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { DataTable } from '../../../components/ui/DataTable';
import { Product } from '../../quoting/types';
import { Plus, Filter, HelpCircle, Settings } from 'lucide-react';
import { CategoryNav } from '../components/CategoryNav';
import { ProductPricingExplainer } from './ProductPricingExplainer';
import { CategoryConfiguration } from '../configuration/CategoryConfiguration';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export function ProductList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    // ... existing state ...
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [explainingProduct, setExplainingProduct] = useState<Product | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [activeSupplier, setActiveSupplier] = useState<string>('All');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('supplier')
            .order('name');

        if (data) setProducts(data);
        if (error) console.error('Error fetching products:', error);
        setLoading(false);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(filter.toLowerCase()) ||
            p.category.toLowerCase().includes(filter.toLowerCase()) ||
            p.supplier.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = categoryParam
            ? p.category === categoryParam
            : true;

        const matchesSupplier = activeSupplier === 'All'
            ? true
            : p.supplier === activeSupplier;

        return matchesSearch && matchesCategory && matchesSupplier;
    });

    const columns = [
        { header: 'Name', accessor: 'name' as keyof Product, className: 'font-medium text-white' },
        { header: 'Category', accessor: 'category' as keyof Product },
        { header: 'Supplier', accessor: 'supplier' as keyof Product },
        { header: 'Pricing Type', accessor: 'pricing_type' as keyof Product, className: 'capitalize text-brand-orange' },
    ];

    const title = categoryParam ? `${categoryParam}` : 'All Products';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-slate-300">
                        {categoryParam ? `Manage your ${categoryParam.toLowerCase()} catalog.` : 'Manage your full product catalog.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {categoryParam && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowConfig(true)}
                            leftIcon={<Settings size={18} />}
                        >
                            Configure Visibility
                        </Button>
                    )}
                    {/* Only show Add button if it matches the current context or global */}
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/products/new')}
                        leftIcon={<Plus size={18} />}
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            {categoryParam && <CategoryNav category={categoryParam} />}

            <div className="w-full md:w-96">
                <Input
                    type="text"
                    placeholder="Search products..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    icon={<Filter size={18} />}
                />
            </div>

            {/* Supplier Tabs */}
            {categoryParam && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {(() => {
                        const suppliers = Array.from(new Set(products.filter(p => !categoryParam || p.category === categoryParam).map(p => p.supplier))).sort();
                        if (suppliers.length <= 1) return null;

                        return (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={activeSupplier === 'All' ? 'primary' : 'secondary'}
                                    onClick={() => setActiveSupplier('All')}
                                >
                                    All
                                </Button>
                                {suppliers.map(s => (
                                    <Button
                                        key={s}
                                        size="sm"
                                        variant={activeSupplier === s ? 'primary' : 'secondary'}
                                        onClick={() => setActiveSupplier(s)}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            <DataTable
                data={filteredProducts}
                columns={[
                    ...columns,
                    {
                        header: 'Logic',
                        accessor: (item: Product) => (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExplainingProduct(item);
                                }}
                                className="p-1.5 rounded-lg hover:bg-brand-orange/20 text-brand-orange hover:text-brand-orange-light transition-colors"
                                title="Explain Pricing Logic"
                            >
                                <HelpCircle size={18} />
                            </button>
                        ),
                        className: 'w-16'
                    }
                ]}
                keyField="id"
                isLoading={loading}
                onEdit={(item) => navigate(`/admin/products/${item.id}`)}
                onDelete={() => { /* TODO: implement delete confirmation */ }}
            />

            <ProductPricingExplainer
                product={explainingProduct}
                onClose={() => setExplainingProduct(null)}
            />

            {showConfig && categoryParam && (
                <CategoryConfiguration
                    category={categoryParam}
                    onClose={() => setShowConfig(false)}
                />
            )}
        </div>
    );
}
