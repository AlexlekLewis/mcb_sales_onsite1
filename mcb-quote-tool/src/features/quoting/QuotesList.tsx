import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Clock, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface Quote {
    id: string;
    customer_name: string;
    status: string;
    total_amount: number;
    created_at: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    draft: { color: 'bg-gray-500/10 text-slate-300', icon: Clock, label: 'Draft' },
    sent: { color: 'bg-blue-500/10 text-blue-400', icon: FileText, label: 'Sent' },
    approved: { color: 'bg-green-500/10 text-green-400', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-red-500/10 text-red-400', icon: XCircle, label: 'Rejected' },
};

export function QuotesList() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuotes() {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setQuotes(data);
            }
            setLoading(false);
        }

        fetchQuotes();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Quotes</h2>
                    <p className="text-slate-300">Manage your quotes and proposals.</p>
                </div>
                <Link
                    to="/quotes/new"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2"
                >
                    <Plus size={16} />
                    New Quote
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-orange" size={32} />
                </div>
            ) : quotes.length === 0 ? (
                <div className="bg-background-card rounded-2xl p-12 border border-white/5 text-center">
                    <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-medium text-white mb-2">No quotes yet</h3>
                    <p className="text-slate-400 mb-6">Create your first quote to get started.</p>
                    <Link
                        to="/quotes/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-xl transition-all"
                    >
                        <Plus size={16} />
                        Create Quote
                    </Link>
                </div>
            ) : (
                <div className="bg-background-card rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => {
                                const status = statusConfig[quote.status] || statusConfig.draft;
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={quote.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-white">{quote.customer_name || 'Unnamed Quote'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">${quote.total_amount?.toFixed(2) || '0.00'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-300 text-sm">
                                                {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/quotes/${quote.id}`} className="text-brand-orange hover:text-brand-orange-light transition-colors">
                                                <ChevronRight size={20} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
