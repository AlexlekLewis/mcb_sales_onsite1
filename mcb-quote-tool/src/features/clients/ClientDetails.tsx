import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Phone, Mail, MapPin, Edit2, Trash2, FileText } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    suburb: string;
    state: string;
    postcode: string;
    notes: string;
    created_at: string;
}

interface Quote {
    id: string;
    customer_name: string;
    status: string;
    total_amount: number;
    created_at: string;
}

export function ClientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Customer | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;

            const { data: clientData } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (clientData) {
                setClient(clientData);

                // Fetch related quotes
                const { data: quotesData } = await supabase
                    .from('quotes')
                    .select('*')
                    .eq('customer_id', id)
                    .order('created_at', { ascending: false });

                if (quotesData) setQuotes(quotesData);
            }
            setLoading(false);
        }
        fetchData();
    }, [id]);

    const deleteClient = async () => {
        if (!client || !confirm('Are you sure you want to delete this client?')) return;

        await supabase.from('customers').delete().eq('id', client.id);
        navigate('/clients');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-brand-orange" size={32} />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-300">Client not found</p>
                <Link to="/clients" className="text-brand-orange hover:text-brand-orange-light mt-4 inline-block">Back to Clients</Link>
            </div>
        );
    }

    const fullAddress = [
        client.address_line1,
        client.address_line2,
        client.suburb,
        client.state,
        client.postcode
    ].filter(Boolean).join(', ');

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/clients')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-slate-300" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                    <p className="text-slate-300">Added {new Date(client.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <button
                    onClick={deleteClient}
                    className="px-4 py-2 bg-white/5 hover:bg-red-600/20 text-red-400 text-sm font-medium rounded-xl transition-all flex items-center gap-2 border border-white/10"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-background-card rounded-2xl p-6 border border-white/5">
                        <h3 className="font-semibold text-white mb-4">Contact</h3>
                        <div className="space-y-3">
                            {client.email && (
                                <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-slate-300 hover:text-brand-orange transition-colors">
                                    <Mail size={18} />
                                    <span className="text-sm">{client.email}</span>
                                </a>
                            )}
                            {client.phone && (
                                <a href={`tel:${client.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-brand-orange transition-colors">
                                    <Phone size={18} />
                                    <span className="text-sm">{client.phone}</span>
                                </a>
                            )}
                            {fullAddress && (
                                <div className="flex items-start gap-3 text-slate-300">
                                    <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{fullAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {client.notes && (
                        <div className="bg-background-card rounded-2xl p-6 border border-white/5">
                            <h3 className="font-semibold text-white mb-2">Notes</h3>
                            <p className="text-slate-300 text-sm">{client.notes}</p>
                        </div>
                    )}
                </div>

                {/* Quote History */}
                <div className="lg:col-span-2">
                    <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Quote History</h3>
                            <Link
                                to={`/quotes/new?customer=${client.id}`}
                                className="text-sm text-brand-orange hover:text-brand-orange-light"
                            >
                                + New Quote
                            </Link>
                        </div>

                        {quotes.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                                <p className="text-slate-400">No quotes for this client yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {quotes.map(quote => (
                                    <Link
                                        key={quote.id}
                                        to={`/quotes/${quote.id}`}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-white">${quote.total_amount?.toFixed(2) || '0.00'}</p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${quote.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                quote.status === 'sent' ? 'bg-blue-500/10 text-blue-400' :
                                                    quote.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-gray-500/10 text-slate-300'
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
