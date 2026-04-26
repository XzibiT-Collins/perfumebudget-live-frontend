import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, children, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'flex w-full appearance-none rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A] dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent/5 disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/5',
                            className
                        )}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                            : children}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999] pointer-events-none" />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
