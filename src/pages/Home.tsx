import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import type { CategoryResponse, ProductListing as ProductListingType } from '../types';

export const Home = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductListingType[]>([]);

  useEffect(() => {
    categoryService.getAll()
      .then((res) => {
        if (Array.isArray(res)) setCategories(res);
      })
      .catch(() => { });

    productService.getFeatured()
      .then((res) => {
        if (Array.isArray(res)) setFeaturedProducts(res);
      })
      .catch(() => { });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#F5F5F5] dark:bg-zinc-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/hero/1920/1080?blur=2"
            alt="Hero"
            className="w-full h-full object-cover opacity-40 dark:opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666666] dark:text-zinc-400 mb-4">
              Signature Scents 2026
            </p>
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] mb-8 dark:text-white">
              Luxury for <br />
              <span className="italic text-accent-dark">Every Budget</span>
            </h1>
            <p className="text-lg text-[#666666] dark:text-zinc-400 mb-10 max-w-lg">
              Discover premium fragrances without the premium price tag. Curated scents from around the world, delivered to your doorstep.
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg">Explore Scents</Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg">Collections</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Truck, title: 'Country-wide Delivery', desc: 'Fast and secure delivery to all parts of Ghana.' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: 'Your transactions are protected by industry-leading encryption.' },
            { icon: Star, title: 'Premium Quality', desc: 'Every piece is handpicked for its superior materials and design.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center card-shadow">
                <feature.icon className="h-6 w-6 text-[#1A1A1A] dark:text-white" />
              </div>
              <h3 className="font-bold uppercase tracking-wider text-sm dark:text-white">{feature.title}</h3>
              <p className="text-sm text-[#666666] dark:text-zinc-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2 dark:text-white">Curated Collections</h2>
            <p className="text-[#666666] dark:text-zinc-400">Find exactly what you're looking for.</p>
          </div>
          {categories.length > 0 && (
            <Link to="/categories" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all dark:text-zinc-300">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="bg-[#FDFBFB] dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-[#F5F5F5] dark:border-zinc-800 flex justify-center items-center h-[300px]">
            <EmptyState icon={<Star className="w-10 h-10 text-[#999999]" />} title="No Collections Available" description="Check back later for new curated collections." />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/products?category=${cat.categoryId}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5] dark:bg-zinc-900"
              >
                <img
                  src={`https://picsum.photos/seed/${cat.slug}/800/800`}
                  alt={cat.categoryName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 dark:opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 text-white">
                  <h3 className="text-sm sm:text-xl font-bold mb-0.5 sm:mb-1">{cat.categoryName}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2 dark:text-white">Featured Pieces</h2>
            <p className="text-[#666666] dark:text-zinc-400">Our most loved items this season.</p>
          </div>
          {featuredProducts.length > 0 && (
            <Link to="/products" className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all dark:text-zinc-300">
              View Collection <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-[#FDFBFB] dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-[#F5F5F5] dark:border-zinc-800 flex justify-center items-center h-[300px]">
            <EmptyState icon={<Star className="w-10 h-10 text-[#999999]" />} title="No Products Available" description="Check back later for new featured pieces." />
          </div>
        ) : (
          <FeaturedCarousel products={featuredProducts} />
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-accent rounded-[2rem] p-12 md:p-20 text-center text-[#1A1A1A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Join Our Olfactory Circle</h2>
            <p className="text-[#666666] mb-10">
              Subscribe to our newsletter for exclusive access to new releases, private sales, and expert fragrance guidance.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white border border-accent-dark/20 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
              />
              <Button className="whitespace-nowrap">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
