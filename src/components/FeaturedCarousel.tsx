import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { ProductListing } from '../types';

interface FeaturedCarouselProps {
  products: ProductListing[];
}

/**
 * A sleek, centered carousel for featured products.
 * Includes auto-play, touch gestures, and smooth spring-based transitions.
 */
export const FeaturedCarousel = ({ products }: FeaturedCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  // Handle auto-play every 4 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, products.length]);

  if (products.length === 0) return null;

  // Gesture configuration
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative w-full max-w-sm mx-auto min-h-[480px] sm:min-h-[600px] flex items-center justify-center py-10">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 100, damping: 20 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.5 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              next();
            } else if (swipe > swipeConfidenceThreshold) {
              prev();
            }
          }}
          className="absolute w-full px-4 sm:px-0"
        >
          <ProductCard product={products[index]} disableAnimation />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons - Hidden on very small screens, sleek on medium+ */}
      <button
        className="absolute left-2 z-10 p-2.5 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-lg border border-gray-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 transition-all hover:scale-110 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Previous product"
      >
        <ChevronLeft className="h-6 w-6 text-zinc-900 dark:text-white" />
      </button>

      <button
        className="absolute right-2 z-10 p-2.5 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-lg border border-gray-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 transition-all hover:scale-110 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next product"
      >
        <ChevronRight className="h-6 w-6 text-zinc-900 dark:text-white" />
      </button>

      {/* Progress Indicators (Dots) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3 z-10 pb-4">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              i === index ? 'w-10 bg-accent' : 'w-2 bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
