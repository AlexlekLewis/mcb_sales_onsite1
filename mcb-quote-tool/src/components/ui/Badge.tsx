import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'secondary' | 'gradient';
}

export const Badge = ({
    className,
    variant = 'default',
    ...props
}: BadgeProps) => {
    const variants = {
        default: "bg-brand-orange/10 text-brand-orange border border-brand-orange/20",
        outline: "text-slate-400 border border-slate-700",
        secondary: "bg-white/10 text-slate-300 border-transparent",
        gradient: "bg-[linear-gradient(135deg,#D97706,#F59E0B)] text-white shadow-orange-glow border-white/10"
    };

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variants[variant],
            className
        )} {...props} />
    );
}
