import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { DataTable } from '../../../components/ui/DataTable';
import { Fabric } from '../../quoting/types';
import { Plus, Filter } from 'lucide-react';
import { CategoryNav } from '../components/CategoryNav';

export function FabricList() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchFabrics();
    }, []);

    const fetchFabrics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('fabrics')
            .select('*')
            .order('brand')
            .order('name');

        if (data) setFabrics(data);
        if (error) console.error('Error fetching fabrics:', error);
        setLoading(false);
    };

    const filteredFabrics = fabrics.filter(f => {
        const matchesSearch =
            f.name.toLowerCase().includes(filter.toLowerCase()) ||
            f.brand.toLowerCase().includes(filter.toLowerCase()) ||
            f.supplier.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = categoryParam
            ? f.product_category === categoryParam
            : true;

        return matchesSearch && matchesCategory;
    });

    const columns = [
        { header: 'Brand', accessor: 'brand' as keyof Fabric, className: 'text-brand-orange font-medium' },
        {
            header: 'Name',
            accessor: 'name' as keyof Fabric,
            className: 'text-white',
            render: (row: Fabric) => (
                <div className="flex items-center gap-2">
                    {row.name}
                    {row.name.includes('Generic') && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Review
                        </span>
                    )}
                </div>
            )
        },
        { header: 'Group', accessor: 'price_group' as keyof Fabric },
        { header: 'Supplier', accessor: 'supplier' as keyof Fabric },
        { header: 'Category', accessor: 'product_category' as keyof Fabric },
    ];

    const title = categoryParam ? `${categoryParam} Fabrics` : 'All Fabrics';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-slate-300">Manage fabric collections and price group mappings.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/fabrics/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl transition-colors font-medium"
                >
                    <Plus size={18} />
                    Add Fabric
                </button>
            </div>

            {categoryParam && <CategoryNav category={categoryParam} />}

            <div className="flex items-center gap-2 bg-background-card p-2 rounded-xl border border-white/5 w-full md:w-96">
                <Filter size={18} className="text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search fabrics..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-500"
                />
            </div>

            <DataTable
                data={filteredFabrics}
                columns={columns}
                keyField="id"
                isLoading={loading}
                onEdit={(item) => navigate(`/admin/fabrics/${item.id}`)}
                onDelete={(item) => console.log('Delete', item)}
            />
        </div>
    );
}
