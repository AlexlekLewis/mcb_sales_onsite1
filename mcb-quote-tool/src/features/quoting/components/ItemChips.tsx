import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ItemChip {
    id: string;
    label: string;
    price: number;
}

interface ItemChipsProps {
    items: ItemChip[];
    activeItemId: string | null;
    onItemSelect: (itemId: string) => void;
    onAddItem: () => void;
}

export function ItemChips({ items, activeItemId, onItemSelect, onAddItem }: ItemChipsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onItemSelect(item.id)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                        activeItemId === item.id
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                            : "bg-white/10 text-slate-300 hover:bg-white/20"
                    )}
                >
                    <span>{item.label}</span>
                    <span className={cn(
                        "font-bold",
                        activeItemId === item.id ? "text-white" : "text-brand-orange"
                    )}>
                        ${item.price.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                    </span>
                </button>
            ))}

            {/* Add Item Button */}
            <button
                onClick={onAddItem}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-dashed border-white/20"
            >
                <Plus size={16} />
                Add Item
            </button>
        </div>
    );
}
