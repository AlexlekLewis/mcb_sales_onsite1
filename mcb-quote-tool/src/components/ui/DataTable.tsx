import React from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    keyField: keyof T;
    isLoading?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    onEdit,
    onDelete,
    keyField,
    isLoading = false
}: DataTableProps<T>) {

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-background-card rounded-xl border border-white/5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-card rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                            {columns.map((col, index) => (
                                <th key={index} className={`px-6 py-4 ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-4 text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                                    className="px-6 py-12 text-center text-slate-400"
                                >
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={String(item[keyField])}
                                    className="hover:bg-brand-orange/5 transition-colors group border-b border-transparent hover:border-brand-orange/10"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={`px-6 py-4 text-sm text-slate-200 ${col.className || ''}`}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-1.5 rounded-lg hover:bg-brand-orange/10 text-slate-400 hover:text-brand-orange transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination placeholder - can be implemented later if needed */}
        </div>
    );
}
