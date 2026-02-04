import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { DataTable } from '../../../components/ui/DataTable';
import { ProductExtra } from '../../quoting/types';
import { Plus, Filter } from 'lucide-react';
import { CategoryNav } from '../components/CategoryNav';

export function ExtrasList() {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [extras, setExtras] = useState<ProductExtra[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchExtras();
    }, []);

    const fetchExtras = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('product_extras')
            .select('*')
            .order('product_category')
            .order('name');

        if (data) setExtras(data);
        if (error) console.error('Error fetching extras:', error);
        setLoading(false);
    };

    const filteredExtras = extras.filter(e => {
        const matchesSearch =
            e.name.toLowerCase().includes(filter.toLowerCase()) ||
            e.product_category.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = categoryParam
            ? e.product_category === categoryParam
            : true;

        return matchesSearch && matchesCategory;
    });

    const columns = [
        { header: 'Name', accessor: 'name' as keyof ProductExtra, className: 'text-white font-medium' },
        { header: 'Price', accessor: (e: ProductExtra) => `$${Number(e.price).toFixed(2)}`, className: 'text-green-400' },
        { header: 'Type', accessor: 'price_type' as keyof ProductExtra, className: 'capitalize' },
        { header: 'Cat', accessor: 'extra_category' as keyof ProductExtra, className: 'text-slate-300 text-sm' },
        { header: 'Product Cat', accessor: 'product_category' as keyof ProductExtra },
        { header: 'Notes', accessor: 'notes' as keyof ProductExtra, className: 'text-slate-400 text-xs italic' },
    ];

    const title = categoryParam ? `${categoryParam} Extras` : 'All Extras';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-slate-300">Manage additional components for {categoryParam || 'all products'}.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl transition-colors font-medium">
                    <Plus size={18} />
                    Add Extra
                </button>
            </div>

            {categoryParam && <CategoryNav category={categoryParam} />}

            <div className="flex items-center gap-2 bg-background-card p-2 rounded-xl border border-white/5 w-full md:w-96">
                <Filter size={18} className="text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search extras..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-500"
                />
            </div>

            <DataTable
                data={filteredExtras}
                columns={columns}
                keyField="id"
                isLoading={loading}
                onEdit={(item) => console.log('Edit', item)}
                onDelete={(item) => console.log('Delete', item)}
            />
        </div>
    );
}
