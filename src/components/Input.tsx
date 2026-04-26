import * as React from "react";
import { cn } from "../utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm transition-all placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A] dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent/5',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/5',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
