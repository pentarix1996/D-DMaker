import React from 'react';
import { cn } from '@/lib/utils';


interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ className, hoverEffect, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-fantasy-panel/80 backdrop-blur-md border border-white/5 rounded-xl shadow-2xl overflow-hidden",
                    hoverEffect && "transition-colors hover:bg-fantasy-panel",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassPanel.displayName = "GlassPanel";
