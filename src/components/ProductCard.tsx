import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Button } from './Button';
import { ShoppingCart, Box } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import type { ProductListing } from '../types';

import { extractErrorMessage } from '../utils';

interface ProductCardProps {
  product: ProductListing;
  disableAnimation?: boolean;
}

export const ProductCard = ({ product, disableAnimation = false }: ProductCardProps) => {
  const { addItem, setIsCartOpen } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(
        product.productId,
        product.productName,
        product.productImageUrl,
        product.price,
        1
      );
      setIsCartOpen(true);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not add to cart'));
    }
  };

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      whileInView={disableAnimation ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden card-shadow transition-all duration-300 hover:-translate-y-1 border border-transparent dark:border-zinc-800"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="aspect-[4/5] overflow-hidden bg-[#FDFBFB] dark:bg-zinc-950">
          {product.productImageUrl ? (
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-100 dark:opacity-80"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Box className="h-12 w-12 opacity-30 mb-2" />
              <span className="text-xs font-medium uppercase tracking-widest opacity-50">No Image</span>
            </div>
          )}
          {product.isOutOfStock && (
            <div className="absolute top-4 left-4">
              <Badge variant="default">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-5 flex flex-col h-full">
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999] dark:text-zinc-500 mb-1">
              {product.categoryName}
            </p>
            <h3 className="text-sm font-serif font-bold text-[#1A1A1A] dark:text-white line-clamp-2 group-hover:text-accent-dark transition-colors">
              {product.productName}
            </h3>
          </div>

          <div className="mt-auto">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.price}</p>

            <div className="hidden sm:flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <p className="text-xs text-[#666666] dark:text-zinc-400">
                {product.isOutOfStock ? 'Unavailable' : 'In stock'}
              </p>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-xl h-9 w-9 border-accent-dark/10"
                onClick={handleAddToCart}
                disabled={product.isOutOfStock}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
