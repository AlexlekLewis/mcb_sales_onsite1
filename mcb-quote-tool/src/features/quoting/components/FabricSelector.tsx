import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Fabric, Product } from '../types';

interface FabricSelectorProps {
    fabrics: Fabric[];
    selectedFabricId: string;
    onFabricChange: (id: string) => void;
    selectedProduct?: Product;
}

export function FabricSelector({ fabrics, selectedFabricId, onFabricChange, selectedProduct }: FabricSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter fabrics
    const filteredFabrics = useMemo(() => {
        if (!search) return fabrics;
        const low = search.toLowerCase();
        return fabrics.filter(f =>
            f.name.toLowerCase().includes(low) ||
            f.brand.toLowerCase().includes(low) ||
            f.price_group.toLowerCase().includes(low)
        );
    }, [fabrics, search]);

    const selectedFabric = fabrics.find(f => f.id === selectedFabricId);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-background-input border rounded-xl px-4 py-3.5 text-left flex items-center justify-between transition-all outline-none focus:ring-1 focus:ring-brand-orange",
                    isOpen ? "border-brand-orange ring-1 ring-brand-orange" : "border-white/10 hover:border-white/20"
                )}
                disabled={!selectedProduct}
            >
                <span className={cn("block truncate", !selectedFabric && "text-slate-500")}>
                    {selectedFabric
                        ? `${selectedFabric.brand} ${selectedFabric.name} (Grp ${selectedFabric.price_group})`
                        : "Select Fabric..."}
                </span>
                <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-background-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-white/5 sticky top-0 bg-background-card">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search fabric name, brand..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/50 transition-colors"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-2 text-slate-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredFabrics.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No fabrics found.
                            </div>
                        ) : (
                            filteredFabrics.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => {
                                        onFabricChange(f.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                                        f.id === selectedFabricId
                                            ? "bg-brand-orange/10 text-brand-orange"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <span>
                                        <span className="font-semibold">{f.brand}</span> {f.name}
                                    </span>
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded border ml-2",
                                        f.id === selectedFabricId
                                            ? "border-brand-orange/30 bg-brand-orange/10"
                                            : "border-white/10 bg-white/5 text-slate-500 group-hover:border-white/20"
                                    )}>
                                        Grp {f.price_group.replace(/^(Grp|Group)\s*/i, '')}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
