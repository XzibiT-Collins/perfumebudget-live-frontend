import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
}

export const Dropdown = ({ value, onChange, options, placeholder = 'Select...' }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E5E5E5] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-accent-dark/40"
            >
                <span className={selected ? '' : 'text-[#999999]'}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-[#999999] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[#E5E5E5] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
                    >
                        <div className="p-1">
                            {options.map((option) => {
                                const isActive = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-colors ${isActive
                                                ? 'bg-accent-dark text-[#1A1A1A] font-semibold'
                                                : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <span>{option.label}</span>
                                        {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
