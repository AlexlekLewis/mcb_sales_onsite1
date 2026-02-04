import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Package, Layers, Scissors, Tag } from 'lucide-react';

interface CategoryNavProps {
    category: string;
}

export function CategoryNav({ category }: CategoryNavProps) {
    // If no category is selected, we don't show the nav (or showed simplified one)
    if (!category) return null;

    const getLink = (path: string) => `${path}?category=${encodeURIComponent(category)}`;

    return (
        <div className="flex items-center gap-2 mb-6 bg-background-card p-1.5 rounded-xl w-fit border border-white/5">
            <NavLink
                to={getLink('/admin/products')}
                end
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                }
            >
                <Package size={16} />
                Products
            </NavLink>

            <div className="w-px h-4 bg-white/10 mx-1" />

            <NavLink
                to={getLink('/admin/fabrics')}
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                }
            >
                <Layers size={16} />
                Fabrics
            </NavLink>

            <NavLink
                to={getLink('/admin/price-groups')}
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                }
            >
                <Tag size={16} />
                Price Groups
            </NavLink>

            <NavLink
                to={getLink('/admin/extras')}
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                }
            >
                <Scissors size={16} />
                Extras
            </NavLink>
        </div>
    );
}
