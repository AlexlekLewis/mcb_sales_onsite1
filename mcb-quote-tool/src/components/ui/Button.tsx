import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}, ref) => {
    const variants = {
        primary: "bg-[linear-gradient(135deg,#D97706,#F59E0B)] text-white shadow-orange-glow border border-white/10 hover:shadow-neon hover:brightness-110",
        secondary: "bg-background-card border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-brand-orange/30",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
        glass: "bg-white/5 border border-white/10 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-10 w-10 p-0 items-center justify-center"
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.97 }}
            className={cn(
                "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-1">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-1">{rightIcon}</span>}
        </motion.button>
    );
});

Button.displayName = "Button";
