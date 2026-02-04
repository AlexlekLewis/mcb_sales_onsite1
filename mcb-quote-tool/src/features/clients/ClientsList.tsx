import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Plus, Users, Search, ChevronRight, Loader2, Phone, Mail, MapPin } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    suburb: string;
    created_at: string;
}

export function ClientsList() {
    const [clients, setClients] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchClients() {
            const { data } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setClients(data);
            setLoading(false);
        }
        fetchClients();
    }, []);

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.suburb?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Clients</h2>
                    <p className="text-slate-300">Manage your customer database.</p>
                </div>
                <Link
                    to="/clients/new"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Client
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full bg-background-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-orange" size={32} />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="bg-background-card rounded-2xl p-12 border border-white/5 text-center">
                    <Users size={48} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {search ? 'No clients found' : 'No clients yet'}
                    </h3>
                    <p className="text-slate-400 mb-6">
                        {search ? 'Try a different search term.' : 'Add your first client to get started.'}
                    </p>
                    {!search && (
                        <Link
                            to="/clients/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-xl transition-all"
                        >
                            <Plus size={16} />
                            Add Client
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredClients.map(client => (
                        <Link
                            key={client.id}
                            to={`/clients/${client.id}`}
                            className="bg-background-card rounded-2xl p-6 border border-white/5 hover:bg-[#1f1f27] transition-all flex items-center gap-6 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-brand-orange-light/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-brand-orange">{client.name?.charAt(0) || '?'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white group-hover:text-brand-orange transition-colors">{client.name}</h3>
                                <div className="flex flex-wrap gap-4 mt-1">
                                    {client.email && (
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <Mail size={14} /> {client.email}
                                        </span>
                                    )}
                                    {client.phone && (
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <Phone size={14} /> {client.phone}
                                        </span>
                                    )}
                                    {client.suburb && (
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <MapPin size={14} /> {client.suburb}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-600 group-hover:text-brand-orange transition-colors" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
