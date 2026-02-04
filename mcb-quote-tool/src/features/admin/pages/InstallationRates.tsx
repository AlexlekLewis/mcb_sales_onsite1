
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, User, DollarSign, Save, Trash2, LayoutGrid, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InstallationRate {
    id: string;
    name: string;
    price: number;
    extra_category: string;
    supplier: string;
    product_category: string;
}

export function InstallationRates() {
    const [installers, setInstallers] = useState<string[]>([]);
    const [selectedInstaller, setSelectedInstaller] = useState<string>('');
    const [rates, setRates] = useState<InstallationRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newInstallerName, setNewInstallerName] = useState('');
    const [showNewInstallerInput, setShowNewInstallerInput] = useState(false);

    // Grouping
    const categories = ['Internal', 'External', 'Surcharge', 'Service'];

    useEffect(() => {
        fetchInstallers();
    }, []);

    useEffect(() => {
        if (selectedInstaller) {
            fetchRates(selectedInstaller);
        } else {
            setRates([]);
        }
    }, [selectedInstaller]);

    const fetchInstallers = async () => {
        try {
            const { data, error } = await supabase
                .from('product_extras')
                .select('supplier')
                .eq('product_category', 'Installation');

            if (error) throw error;

            // Unique suppliers
            const unique = Array.from(new Set(data.map(d => d.supplier).filter(Boolean))).sort();
            setInstallers(unique);
            if (unique.length > 0 && !selectedInstaller) {
                setSelectedInstaller(unique[0]);
            }
        } catch (error) {
            console.error('Error fetching installers:', error);
            toast.error('Failed to load installers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRates = async (supplier: string) => {
        try {
            const { data, error } = await supabase
                .from('product_extras')
                .select('*')
                .eq('product_category', 'Installation')
                .eq('supplier', supplier)
                .order('name');

            if (error) throw error;
            setRates(data || []);
        } catch (error) {
            console.error('Error fetching rates:', error);
            toast.error('Failed to load rates');
        }
    };

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        try {
            const { error } = await supabase
                .from('product_extras')
                .update({ price: newPrice })
                .eq('id', id);

            if (error) throw error;

            setRates(rates.map(r => r.id === id ? { ...r, price: newPrice } : r));
            toast.success('Price updated');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleAddInstaller = async () => {
        if (!newInstallerName.trim()) return;
        // Just switch view to this new 'virtual' installer - real record created when rate added
        setInstallers([...installers, newInstallerName]);
        setSelectedInstaller(newInstallerName);
        setShowNewInstallerInput(false);
        setNewInstallerName('');
        toast.success(`Switched to ${newInstallerName}. Add a rate to save.`);
    };

    const handleAddRate = async (category: string) => {
        const name = prompt(`Enter Name for new ${category} rate:`);
        if (!name) return;

        try {
            // Default price 0
            const payload = {
                name,
                price: 0,
                extra_category: category,
                supplier: selectedInstaller,
                product_category: 'Installation',
                is_active: true
            };

            const { data, error } = await supabase
                .from('product_extras')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            setRates([...rates, data]);
            toast.success('Rate added');
        } catch (error) {
            toast.error('Failed to add rate');
        }
    };

    return (
        <div className="flex h-full">
            {/* Sidebar: Installers */}
            <div className="w-64 border-r border-white/10 bg-[#1a1b23] p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <User size={18} className="text-brand-orange" /> Installers
                    </h3>
                    <button
                        onClick={() => setShowNewInstallerInput(!showNewInstallerInput)}
                        className="p-1 hover:bg-white/10 rounded"
                    >
                        <Plus size={16} className="text-slate-300" />
                    </button>
                </div>

                {showNewInstallerInput && (
                    <div className="flex gap-2">
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            placeholder="New Installer Name..."
                            value={newInstallerName}
                            onChange={e => setNewInstallerName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddInstaller()}
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex flex-col gap-1 overflow-y-auto">
                    {installers.map(inst => (
                        <button
                            key={inst}
                            onClick={() => setSelectedInstaller(inst)}
                            className={`px-3 py-2 text-left text-sm rounded-lg transition-colors ${selectedInstaller === inst
                                    ? 'bg-brand-orange/20 text-brand-orange font-medium'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {inst}
                        </button>
                    ))}
                    {installers.length === 0 && !loading && (
                        <p className="text-xs text-gray-600 italic px-2">No installers found.</p>
                    )}
                </div>
            </div>

            {/* Main Content: Rates */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">{selectedInstaller} Rates</h1>
                    <p className="text-slate-300">Manage installation pricing matrix.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categories.map(cat => {
                        const catRates = rates.filter(r => r.extra_category === cat);
                        return (
                            <div key={cat} className="bg-[#1a1b23] rounded-xl border border-white/5 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cat === 'Internal' ? 'bg-emerald-400' :
                                                cat === 'External' ? 'bg-orange-400' :
                                                    cat === 'Surcharge' ? 'bg-rose-400' : 'bg-blue-400'
                                            }`} />
                                        {cat}
                                    </h3>
                                    <button
                                        onClick={() => handleAddRate(cat)}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-slate-200 px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {catRates.map(rate => (
                                        <div key={rate.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg group hover:bg-black/30 transition-colors">
                                            <span className="text-sm text-slate-200">{rate.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <DollarSign size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-transparent border border-white/10 rounded px-2 pl-6 py-1 text-sm text-right text-white focus:border-brand-orange outline-none"
                                                        defaultValue={rate.price}
                                                        onBlur={(e) => handleUpdatePrice(rate.id, parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {catRates.length === 0 && (
                                        <div className="text-center py-4 text-gray-600 text-sm italic border border-dashed border-white/5 rounded-lg">
                                            No rates in this category
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
