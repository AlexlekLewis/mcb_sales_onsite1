import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, User, MapPin, FileText, ArrowRight, Loader2, Plus, X, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StartQuoteModalProps {
    onStart: (quoteId: string, customerName: string, selectedRanges: string[]) => void;
    onCancel: () => void;
}

interface ProductRange {
    id: string;   // "supplier|category" composite key
    label: string; // e.g. "Creative Internal Blinds"
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address_line1: string;
    suburb: string;
    state: string;
    postcode: string;
}

export function StartQuoteModal({ onStart, onCancel }: StartQuoteModalProps) {
    const [customerName, setCustomerName] = useState('');
    const [siteAddress, setSiteAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [creating, setCreating] = useState(false);

    // Client search
    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Product range selection
    const [availableRanges, setAvailableRanges] = useState<ProductRange[]>([]);
    const [selectedRanges, setSelectedRanges] = useState<Set<string>>(new Set());
    const [rangesLoading, setRangesLoading] = useState(true);

    // Fetch distinct product ranges on mount
    useEffect(() => {
        async function fetchRanges() {
            setRangesLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('supplier, category')
                    .eq('is_active', true);

                if (error) throw error;

                // Deduplicate to unique supplier|category combos
                const seen = new Set<string>();
                const ranges: ProductRange[] = [];
                (data || []).forEach(p => {
                    const id = `${p.supplier}|${p.category}`;
                    if (!seen.has(id)) {
                        seen.add(id);
                        ranges.push({ id, label: `${p.supplier} ${p.category}` });
                    }
                });
                ranges.sort((a, b) => a.label.localeCompare(b.label));
                setAvailableRanges(ranges);

                // Pre-select Internal Blinds if available, otherwise select first
                const defaultRange = ranges.find(r => r.id.includes('Internal Blinds'));
                if (defaultRange) {
                    setSelectedRanges(new Set([defaultRange.id]));
                } else if (ranges.length > 0) {
                    setSelectedRanges(new Set([ranges[0].id]));
                }
            } catch (err) {
                console.error('Failed to load product ranges:', err);
            } finally {
                setRangesLoading(false);
            }
        }
        fetchRanges();
    }, []);

    const toggleRange = (rangeId: string) => {
        setSelectedRanges(prev => {
            const next = new Set(prev);
            if (next.has(rangeId)) {
                // Don't allow deselecting the last one
                if (next.size <= 1) return prev;
                next.delete(rangeId);
            } else {
                next.add(rangeId);
            }
            return next;
        });
    };

    // Fetch customers for typeahead
    useEffect(() => {
        if (searchQuery.length < 2) {
            setCustomers([]);
            return;
        }

        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('customers')
                .select('id, name, email, phone, address_line1, suburb, state, postcode')
                .ilike('name', `%${searchQuery}%`)
                .limit(8);

            if (data) setCustomers(data);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectCustomer = (customer: Customer) => {
        setCustomerName(customer.name);
        setSelectedCustomerId(customer.id);
        setSearchQuery(customer.name);
        setShowDropdown(false);

        // Auto-fill site address from customer if available
        const addr = [customer.address_line1, customer.suburb, customer.state, customer.postcode]
            .filter(Boolean)
            .join(', ');
        if (addr && !siteAddress) setSiteAddress(addr);
    };

    const handleStart = async () => {
        const name = customerName.trim() || searchQuery.trim();
        if (!name) return;

        setCreating(true);
        try {
            const quoteRecord: Record<string, unknown> = {
                customer_name: name,
                status: 'draft',
                total_amount: 0,
                overall_margin_percent: 45,
                show_gst: false,
            };
            if (selectedCustomerId) quoteRecord.customer_id = selectedCustomerId;
            if (siteAddress.trim()) quoteRecord.site_address = siteAddress.trim();
            if (notes.trim()) quoteRecord.notes = notes.trim();

            const { data: quote, error } = await supabase
                .from('quotes')
                .insert(quoteRecord)
                .select()
                .single();

            if (error || !quote) {
                throw new Error(error?.message || 'Failed to create draft');
            }

            onStart(quote.id, name, Array.from(selectedRanges));
        } catch (err: any) {
            console.error('Error creating draft quote:', err);
            alert(`Failed to start quote: ${err.message}`);
        } finally {
            setCreating(false);
        }
    };

    const currentName = customerName.trim() || searchQuery.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-background-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#1c1c24]">
                    <div>
                        <h2 className="text-xl font-bold text-white">Start New Quote</h2>
                        <p className="text-sm text-slate-400 mt-0.5">Enter client details to begin</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Client Name / Search */}
                    <div ref={searchRef} className="relative">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Client Name *
                        </label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCustomerName('');
                                    setSelectedCustomerId(null);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                                placeholder="Search existing or type new name..."
                                className="w-full bg-[#1c1c24] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                                autoFocus
                            />
                        </div>

                        {/* Dropdown */}
                        {showDropdown && customers.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-[#1c1c24] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {customers.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => selectCustomer(c)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                    >
                                        <User size={16} className="text-brand-orange flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                            {c.suburb && (
                                                <p className="text-xs text-slate-500 truncate">{c.suburb}, {c.state}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* New client indicator */}
                        {searchQuery.length >= 2 && !selectedCustomerId && (
                            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                                <Plus size={12} /> Will create as new client name
                            </p>
                        )}
                    </div>

                    {/* Site Address */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            <MapPin size={12} className="inline mr-1" />
                            Site Address
                        </label>
                        <input
                            type="text"
                            value={siteAddress}
                            onChange={(e) => setSiteAddress(e.target.value)}
                            placeholder="123 Main St, Richmond VIC 3121"
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            <FileText size={12} className="inline mr-1" />
                            Quick Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What are they looking for? E.g. 3x roller blinds, 2x curtains..."
                            rows={2}
                            className="w-full bg-[#1c1c24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors resize-none"
                        />
                    </div>

                    {/* Product Ranges */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Product Ranges
                        </label>
                        {rangesLoading ? (
                            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                                <Loader2 size={14} className="animate-spin" />
                                Loading ranges...
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableRanges.map(range => {
                                    const isSelected = selectedRanges.has(range.id);
                                    return (
                                        <button
                                            key={range.id}
                                            type="button"
                                            onClick={() => toggleRange(range.id)}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5",
                                                isSelected
                                                    ? "bg-brand-orange/15 border-brand-orange/50 text-brand-orange"
                                                    : "bg-[#1c1c24] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                                            )}
                                        >
                                            {isSelected && <Check size={14} />}
                                            {range.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-[10px] text-slate-600 mt-1.5">Select the product types you'll be quoting. You can add more later.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-white/5 bg-[#1c1c24] flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={!currentName || creating || selectedRanges.size === 0}
                        className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-orange/20 flex items-center gap-2 transition-all"
                    >
                        {creating ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <ArrowRight size={18} />
                        )}
                        Start Building
                    </button>
                </div>
            </div>
        </div>
    );
}
