import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Logic to show limited page numbers if totalPages is large could be added here
  // For now, simple list

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 rounded-lg"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Simple logic to hide pages if too many, showing start, end, and current neighborhood
          if (
            totalPages > 7 &&
            page !== 1 &&
            page !== totalPages &&
            (page < currentPage - 1 || page > currentPage + 1)
          ) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="text-zinc-400 dark:text-zinc-500 px-1">...</span>;
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                currentPage === page
                  ? "bg-accent text-[#1A1A1A] font-bold"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 rounded-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
