import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Quote {
    id: string;
    customer_name: string;
    status: string;
    created_at: string;
}

interface QuoteSelectorProps {
    selectedQuoteId: string | null;
    onSelect: (quoteId: string | null, quoteName: string | null) => void;
}

export function QuoteSelector({ selectedQuoteId, onSelect }: QuoteSelectorProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        const { data, error } = await supabase
            .from('quotes')
            .select('id, customer_name, status, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setQuotes(data);
        }
        setLoading(false);
    };

    const filteredQuotes = quotes.filter(q =>
        (q.customer_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/[0.08] transition-colors"
            >
                <div className="flex items-center gap-2 text-left min-w-0">
                    <FileText size={16} className="text-brand-orange shrink-0" />
                    {selectedQuote ? (
                        <span className="text-slate-200 truncate">
                            {selectedQuote.customer_name || 'Unnamed Quote'}
                            <span className="text-slate-500 ml-2 text-xs">
                                ({selectedQuote.status})
                            </span>
                        </span>
                    ) : (
                        <span className="text-slate-400">Link to a quote (optional)</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedQuoteId && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(null, null);
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={14} className="text-slate-400" />
                        </button>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background-card border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-[300px]">
                    {/* Search */}
                    <div className="p-2 border-b border-white/5">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search quotes..."
                                className="bg-transparent text-sm text-slate-200 outline-none flex-1 placeholder:text-slate-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="overflow-y-auto max-h-[220px]">
                        <button
                            onClick={() => {
                                onSelect(null, null);
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-400 hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                            No quote (standalone note)
                        </button>

                        {loading ? (
                            <div className="px-4 py-3 text-sm text-slate-500">Loading quotes...</div>
                        ) : filteredQuotes.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500">No quotes found</div>
                        ) : (
                            filteredQuotes.map(quote => (
                                <button
                                    key={quote.id}
                                    onClick={() => {
                                        onSelect(quote.id, quote.customer_name);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${selectedQuoteId === quote.id ? 'bg-brand-orange/10 text-brand-orange' : 'text-slate-200'
                                        }`}
                                >
                                    <div className="font-medium">{quote.customer_name || 'Unnamed Quote'}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {quote.status} • {new Date(quote.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
