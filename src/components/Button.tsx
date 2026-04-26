import * as React from "react";
import { cn } from "../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#1A1A1A] text-white hover:bg-accent-dark dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-accent',
      secondary: 'bg-accent text-[#1A1A1A] hover:bg-accent-dark border border-accent-dark/20 dark:text-zinc-900',
      outline: 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-accent hover:border-accent dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-accent dark:hover:text-zinc-900',
      ghost: 'bg-transparent text-[#1A1A1A] hover:bg-accent/30 dark:text-zinc-300 dark:hover:bg-zinc-800',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm font-medium',
      lg: 'px-8 py-3 text-base font-medium',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
