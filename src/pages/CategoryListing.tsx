import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import type { CategoryResponse } from '../types';

export const CategoryListing = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => { });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 dark:text-white">Categories</h1>
        <p className="text-[#666666] dark:text-zinc-400 max-w-2xl mx-auto">
          Explore our collections curated by olfactory family. Find your signature scent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.categoryId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/products?category=${cat.categoryId}`}
              className="group relative block aspect-[16/9] overflow-hidden rounded-[2.5rem] bg-[#F5F5F5] dark:bg-zinc-900 card-shadow"
            >
              <img
                src={`https://picsum.photos/seed/${cat.slug}/1200/800`}
                alt={cat.categoryName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-bold mb-2">{cat.categoryName}</h3>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium opacity-80 uppercase tracking-widest">
                    {cat.description}
                  </p>
                  <div className="h-px w-8 bg-white/40" />
                  <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
