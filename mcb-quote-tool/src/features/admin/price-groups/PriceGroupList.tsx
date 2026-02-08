import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { DataTable } from '../../../components/ui/DataTable';
import { PriceGroup } from '../../quoting/types';
import { Plus, Filter } from 'lucide-react';
import { CategoryNav } from '../components/CategoryNav';
import { Button } from '../../../components/ui/Button';

export function PriceGroupList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const supplierParam = searchParams.get('supplier');

    const [groups, setGroups] = useState<PriceGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [activeSupplier, setActiveSupplier] = useState<string>(supplierParam || 'All');

    // Sync supplier tab with URL param
    const handleSupplierChange = (supplier: string) => {
        setActiveSupplier(supplier);
        const newParams = new URLSearchParams(searchParams);
        if (supplier === 'All') {
            newParams.delete('supplier');
        } else {
            newParams.set('supplier', supplier);
        }
        setSearchParams(newParams, { replace: true });
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('price_groups')
            .select('*')
            .order('supplier')
            .order('group_code');

        if (data) setGroups(data);
        if (error) console.error('Error fetching price groups:', error);
        setLoading(false);
    };

    const filteredGroups = groups.filter(g => {
        const matchesSearch =
            g.group_name.toLowerCase().includes(filter.toLowerCase()) ||
            g.group_code.toLowerCase().includes(filter.toLowerCase()) ||
            g.supplier.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = categoryParam
            ? g.category === categoryParam
            : true;

        const matchesSupplier = activeSupplier === 'All'
            ? true
            : g.supplier === activeSupplier;

        return matchesSearch && matchesCategory && matchesSupplier;
    });

    const columns = [
        { header: 'Code', accessor: 'group_code' as keyof PriceGroup, className: 'font-mono text-brand-orange' },
        { header: 'Name', accessor: 'group_name' as keyof PriceGroup, className: 'text-white font-medium' },
        { header: 'Multiplier', accessor: (g: PriceGroup) => `${g.multiplier}x`, className: 'text-slate-200' },
        { header: 'Supplier', accessor: 'supplier' as keyof PriceGroup },
        { header: 'Category', accessor: 'category' as keyof PriceGroup },
    ];

    const title = categoryParam ? `${categoryParam} Price Groups` : 'All Price Groups';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-slate-300">Manage price groups and multipliers for fabrics.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl transition-colors font-medium">
                    <Plus size={18} />
                    Add Price Group
                </button>
            </div>

            {categoryParam && <CategoryNav category={categoryParam} />}

            <div className="flex items-center gap-2 bg-background-card p-2 rounded-xl border border-white/5 w-full md:w-96">
                <Filter size={18} className="text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search price groups..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-500"
                />
            </div>

            {/* Supplier Tabs */}
            {categoryParam && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {(() => {
                        const suppliers = Array.from(new Set(groups.filter(g => !categoryParam || g.category === categoryParam).map(g => g.supplier))).sort();
                        if (suppliers.length <= 1) return null;

                        return (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={activeSupplier === 'All' ? 'primary' : 'secondary'}
                                    onClick={() => handleSupplierChange('All')}
                                >
                                    All
                                </Button>
                                {suppliers.map(s => (
                                    <Button
                                        key={s}
                                        size="sm"
                                        variant={activeSupplier === s ? 'primary' : 'secondary'}
                                        onClick={() => handleSupplierChange(s)}
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
                data={filteredGroups}
                columns={columns}
                keyField="id"
                isLoading={loading}
                onEdit={() => { /* TODO: implement edit modal */ }}
                onDelete={() => { /* TODO: implement delete confirmation */ }}
            />
        </div>
    );
}
