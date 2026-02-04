import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'glass' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    className,
    variant = 'default',
    children,
    ...props
}, ref) => {
    const variants = {
        default: "bg-[#1E293B] border-white/5",
        glass: "bg-white/5 backdrop-blur-md border-white/10",
        interactive: "bg-[#1E293B] border-white/5 hover:border-brand-orange/30 hover:shadow-orange-glow cursor-pointer transition-all duration-300"
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl border shadow-sm overflow-hidden",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Card.displayName = "Card";

export const CardHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
        {children}
    </div>
);

export const CardTitle = ({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}>
        {children}
    </h3>
);

export const CardContent = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6 pt-0", className)}>
        {children}
    </div>
);

export const CardFooter = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center p-6 pt-0", className)}>
        {children}
    </div>
);
