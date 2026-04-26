import { Check } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
}

export const Checkbox = ({ checked, onChange, label, description, id, disabled, className = '' }: CheckboxProps) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <label
            htmlFor={inputId}
            className={`flex items-start gap-2.5 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'} ${className}`}
        >
            <div className="relative shrink-0 mt-0.5">
                <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    className="sr-only"
                    disabled={disabled}
                />
                <div
                    className={`h-5 w-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center
            ${checked
                            ? 'bg-accent-dark border-accent-dark'
                            : 'bg-white dark:bg-zinc-900 border-[#D4D4D4] dark:border-zinc-600'
                        } ${!disabled && !checked ? 'group-hover:border-accent-dark/60' : ''}`}
                >
                    {checked && (
                        <Check className="h-3 w-3 text-[#1A1A1A] stroke-[3]" />
                    )}
                </div>
            </div>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className="text-sm text-[#1A1A1A] dark:text-white font-medium">{label}</span>
                    )}
                    {description && (
                        <span className="text-xs text-[#666666] dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
};
