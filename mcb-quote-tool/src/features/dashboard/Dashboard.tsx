import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
    FileText,
    DollarSign,
    TrendingUp,
    Users,
    Plus,
    Mic,
    Camera,
    Calculator,
    ArrowRight,
    Loader2
} from 'lucide-react';

interface Stats {
    totalQuotes: number;
    totalValue: number;
    thisWeek: number;
    avgQuoteValue: number;
}

export function Dashboard() {
    const [stats, setStats] = useState<Stats>({ totalQuotes: 0, totalValue: 0, thisWeek: 0, avgQuoteValue: 0 });
    const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // Fetch all quotes
            const { data: quotes } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });

            if (quotes) {
                const totalQuotes = quotes.length;
                const totalValue = quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);
                const avgQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;

                // This week calculation (simple)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const thisWeek = quotes.filter(q => new Date(q.created_at) >= oneWeekAgo).length;

                setStats({ totalQuotes, totalValue, thisWeek, avgQuoteValue });
                setRecentQuotes(quotes.slice(0, 5));
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Quotes', value: stats.totalQuotes, icon: FileText, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
        { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Pipeline Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
        { label: 'Avg Quote', value: `$${stats.avgQuoteValue.toFixed(0)}`, icon: Calculator, color: 'text-brand-blue-light', bg: 'bg-brand-blue/10' },
    ];

    const quickActions = [
        { label: 'New Quote', icon: Plus, href: '/quotes/new', color: 'bg-[linear-gradient(135deg,#D97706,#F59E0B)] shadow-orange-glow text-white hover:brightness-110 border border-white/10' },
        { label: 'Voice Notes', icon: Mic, href: '/notes', color: 'bg-background-card hover:bg-white/5 text-slate-200 border border-white/5' },
        { label: 'Site Photos', icon: Camera, href: '/photos', color: 'bg-background-card hover:bg-white/5 text-slate-200 border border-white/5' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-slate-300">Your on-site quoting command center.</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-brand-orange" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-background-card rounded-2xl p-6 border border-white/5 shadow-glass">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                                    <Icon size={20} className={stat.color} />
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, i) => (
                    <Link
                        key={i}
                        to={action.href}
                        onClick={(e) => {
                            if (action.href === '#' || action.label === 'Voice Notes' || action.label === 'Site Photos') {
                                e.preventDefault();
                                alert(`${action.label} is coming soon!`);
                            }
                        }}
                        className={`${action.color} p-4 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glass ${['Voice Notes', 'Site Photos'].includes(action.label) ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                    >
                        <action.icon size={20} />
                        <span className="font-medium">{action.label} {['Voice Notes', 'Site Photos'].includes(action.label) && <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/70">Soon</span>}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Quotes */}
            <div className="bg-background-card rounded-2xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Recent Quotes</h3>
                    <Link to="/quotes" className="text-sm text-brand-orange hover:text-brand-orange-light flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                {recentQuotes.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No quotes yet. Create your first quote!</p>
                ) : (
                    <div className="space-y-3">
                        {recentQuotes.map(quote => (
                            <Link
                                key={quote.id}
                                to={`/quotes/${quote.id}`}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-white">{quote.customer_name || 'Unnamed Quote'}</p>
                                    <p className="text-sm text-slate-400">
                                        {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <span className="font-medium text-white">${quote.total_amount?.toFixed(2) || '0.00'}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
