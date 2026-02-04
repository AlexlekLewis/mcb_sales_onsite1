import React from 'react';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
    label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    className,
    type,
    icon,
    error,
    label,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-xl border border-white/10 bg-[#0C1425] px-3 py-2 text-sm text-white",
                        "placeholder:text-slate-500",
                        "focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 focus:shadow-orange-glow",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-300",
                        icon && "pl-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
