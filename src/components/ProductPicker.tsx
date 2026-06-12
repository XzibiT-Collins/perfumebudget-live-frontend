import { useEffect, useRef, useState } from 'react';
import { Search, X, Loader2, Box } from 'lucide-react';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import type { ProductListing } from '../types';

interface ProductPickerProps {
  selected: ProductListing | null;
  onSelect: (product: ProductListing | null) => void;
  placeholder?: string;
  label?: string;
}

/**
 * Debounced admin product search with a results dropdown.
 * Mirrors the picker pattern used in WalkInOrderCreation.
 */
export const ProductPicker = ({ selected, onSelect, placeholder = 'Search products...', label }: ProductPickerProps) => {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);
  const [results, setResults] = useState<ProductListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.trim()) {
      setIsSearching(true);
      productService
        .adminSearch({ searchTerm: debounced, page: 0, size: 8 })
        .then((res) => {
          setResults(res.content);
          setShowResults(true);
        })
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debounced]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pick = (product: ProductListing) => {
    onSelect(product);
    setQuery('');
    setShowResults(false);
  };

  if (selected) {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
            {label}
          </label>
        )}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] dark:border-zinc-800 bg-[#F5F5F5] dark:bg-zinc-800/50 px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {selected.productImageUrl ? (
              <img src={selected.productImageUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                <Box className="h-4 w-4 text-zinc-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold dark:text-white truncate">{selected.productName}</p>
              <p className="text-[11px] text-zinc-500">Stock: {selected.stockQuantity}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"
            title="Clear product"
          >
            <X className="h-4 w-4 text-[#666666] dark:text-zinc-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5" ref={ref}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#E5E5E5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent-dark/40"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999] animate-spin" />
        )}

        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#F5F5F5] dark:border-zinc-800 z-50 overflow-hidden">
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {results.map((p) => (
                <button
                  key={p.productId}
                  type="button"
                  onClick={() => pick(p)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  {p.productImageUrl ? (
                    <img src={p.productImageUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                      <Box className="h-4 w-4 text-zinc-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold dark:text-white truncate">{p.productName}</p>
                    <p className="text-[11px] text-zinc-500">
                      {p.price} • Stock: {p.stockQuantity}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {showResults && !isSearching && results.length === 0 && debounced.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#F5F5F5] dark:border-zinc-800 z-50 p-4 text-center text-sm text-zinc-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
};
