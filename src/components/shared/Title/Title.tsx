import React from 'react';
import { cn } from '@/lib/utils';

interface TitleProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    centered?: boolean;
    showUnderline?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'default' | 'muted' | 'primary' | 'accent';
}

export const Title: React.FC<TitleProps> = ({
    children,
    className,
    id,
    level = 2,
    centered = true,
    showUnderline = true,
    size = 'lg',
    color = 'default'
}) => {
    const sizeClasses = {
        sm: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
        md: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
        lg: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
        xl: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
    };

    const colorClasses = {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-primary',
        accent: 'text-accent-foreground'
    };

    const HeadingComponent = React.createElement(
        `h${level}`,
        {
            id,
            className: cn(
                'font-serif mb-4',
                sizeClasses[size],
                colorClasses[color],
                'leading-tight tracking-tight',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
                centered && 'text-center'
            ),
            tabIndex: id ? 0 : undefined // Only make focusable if it has an ID (for anchor links)
        },
        children
    );

    return (
        <div className={cn(
            'w-full max-w-4xl',
            centered && 'mx-auto text-center',
            className
        )}>
            {HeadingComponent}
            {showUnderline && (
                <div
                    className={cn(
                        'h-1 bg-primary rounded-full mt-4',
                        'w-16 sm:w-20 md:w-24 lg:w-28',
                        centered && 'mx-auto',
                        'dark:bg-primary/80' // Better contrast in dark mode
                    )}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};