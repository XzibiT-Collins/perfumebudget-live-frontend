import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../utils';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    className?: string;
}

export const EmptyState = ({ icon, title, description, className }: EmptyStateProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center w-full h-full min-h-[200px]", className)}>
            <div className="bg-[#F5F5F5] dark:bg-zinc-800 p-4 rounded-full mb-4">
                {icon || <Inbox className="w-8 h-8 text-[#999999] dark:text-zinc-500" />}
            </div>
            <h4 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2">{title}</h4>
            {description && (
                <p className="text-sm text-[#666666] dark:text-zinc-400 max-w-sm">
                    {description}
                </p>
            )}
        </div>
    );
};
