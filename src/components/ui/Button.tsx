import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
    active?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, active, children, ...props }, ref) => {

        const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-fantasy-accent/50 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-fantasy-accent/20 border border-fantasy-accent/50 text-fantasy-gold hover:bg-fantasy-accent/30 hover:border-fantasy-accent hover:shadow-[0_0_15px_rgba(176,38,255,0.4)] backdrop-blur-sm",
            secondary: "bg-fantasy-panel border border-fantasy-muted/20 text-fantasy-text hover:bg-white/5 hover:border-fantasy-gold/30",
            ghost: "bg-transparent hover:bg-white/5 text-fantasy-muted hover:text-fantasy-text",
            danger: "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-2",
        };

        const activeState = active ? "ring-2 ring-fantasy-gold shadow-[0_0_10px_rgba(255,215,0,0.3)] bg-fantasy-accent/40" : "";

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    activeState,
                    fullWidth && "w-full",
                    className
                )}
                {...(props as any)}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export { Button };
