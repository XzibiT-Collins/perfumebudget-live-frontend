import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { CategoryResponse, ProductListing } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Dropdown, DropdownOption } from '../components/Dropdown';

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

const PAGE_SIZE = 9;

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = Number(searchParams.get('page') || 1);
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'default';

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build category options for Dropdown
  const categoryOptions: DropdownOption[] = [
    { label: 'All Categories', value: '' },
    ...categories.map((c) => ({ label: c.categoryName, value: String(c.categoryId) })),
  ];

  // Load categories once
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (Array.isArray(res)) setCategories(res);
    }).catch(() => { });
  }, []);

  // Fetch products whenever filters or page change
  useEffect(() => {
    setIsLoading(true);

    const backendSort = (() => {
      switch (sortBy) {
        case 'price_asc': return 'price.amount,asc';
        case 'price_desc': return 'price.amount,desc';
        case 'name_asc': return 'name,asc';
        default: return undefined;
      }
    })();

    const isInitialLoad = !selectedCategory && !debouncedSearchQuery && sortBy === 'default';

    const fetchPromise = isInitialLoad
      ? productService.getListings(currentPage - 1, PAGE_SIZE)
      : productService.search({
          categoryId: selectedCategory ? Number(selectedCategory) : undefined,
          searchTerm: debouncedSearchQuery || undefined,
          page: currentPage - 1,
          size: PAGE_SIZE,
          sort: backendSort,
        });

    fetchPromise
      .then((res) => {
        if (res && Array.isArray(res.content)) {
          setProducts(res.content);
          setTotalPages(res.totalPages || 1);
        }
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [currentPage, selectedCategory, debouncedSearchQuery, sortBy]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page'); // reset to page 1 on filter change
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 hidden sm:block">
        <h1 className="text-4xl font-serif font-bold dark:text-white mb-2">All Fragrances</h1>
        <p className="text-[#666666] dark:text-zinc-400">
          Explore our full collection of curated scents.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Filters */}
        <aside className="w-full lg:w-56 shrink-0 space-y-4 lg:space-y-6">
          {/* Row 1: Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <input
              type="text"
              placeholder="Search fragrances..."
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent outline-none"
            />
          </div>

          {/* Row 2: Category and Sort (side-by-side on mobile, stacked on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 items-end">
            {/* Category filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-3 hidden lg:block">Category</p>

              {/* Mobile: Dropdown */}
              <div className="lg:hidden">
                <Dropdown
                  value={selectedCategory}
                  onChange={(val) => updateParam('category', val)}
                  options={categoryOptions}
                />
              </div>

              {/* Desktop: Vertical list */}
              <div className="hidden lg:block space-y-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-accent-dark text-[#1A1A1A] font-semibold' : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => updateParam('category', String(cat.categoryId))}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedCategory === String(cat.categoryId) ? 'bg-accent-dark text-[#1A1A1A] font-semibold' : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800'}`}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-3 hidden lg:block">Sort</p>
              <Dropdown
                value={sortBy}
                onChange={(val) => updateParam('sort', val)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <SlidersHorizontal className="h-10 w-10 text-[#CCCCCC] mb-4" />
              <p className="text-[#666666] dark:text-zinc-400">No fragrances found.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {products.map((product) => (
                <div key={product.productId}>
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          )}

          {totalPages > 1 && !isLoading && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => updateParam('page', String(p))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
