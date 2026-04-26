import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, Box } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { formatPrice, parsePrice } from '../utils';

export const CartDrawer = () => {
  const { user } = useAuth();
  const { cartItems, localItems, totalPrice, isCartOpen, setIsCartOpen, removeItem, updateQuantity } = useCart();

  // Normalise to a common display shape
  const items = user
    ? cartItems.map((i) => ({
      id: i.cartItemId,
      name: i.productName,
      imageUrl: i.productImageUrl,
      price: i.unitPrice,
      quantity: i.quantity,
    }))
    : localItems.map((i) => ({
      id: i.productId,
      name: i.productName,
      imageUrl: i.productImageUrl,
      price: i.unitPrice,
      quantity: i.quantity,
    }));

  const subtotal = user
    ? totalPrice
    : formatPrice(localItems.reduce((s, i) => s + parsePrice(i.unitPrice) * i.quantity, 0));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#F5F5F5] dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 dark:text-white" />
                <h2 className="text-xl font-serif font-bold dark:text-white">Your Bag</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-900 rounded-full transition-colors"
              >
                <X className="h-5 w-5 dark:text-zinc-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 bg-[#FDFBFB] dark:bg-zinc-900 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-[#999999] dark:text-zinc-600" />
                  </div>
                  <p className="text-[#666666] dark:text-zinc-400">Your bag is empty</p>
                  <Button variant="outline" size="sm" onClick={() => setIsCartOpen(false)}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-24 w-20 rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-zinc-900 flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover opacity-100 dark:opacity-80"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Box className="h-6 w-6 opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium line-clamp-1 dark:text-zinc-100">{item.name}</h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#999999] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[#999999] dark:text-zinc-500 mt-1">{item.price} each</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[#E5E5E5] dark:border-zinc-800 rounded-full px-1 py-0.5 bg-white dark:bg-zinc-900">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                              <Minus className="h-3 w-3 dark:text-zinc-400" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium dark:text-zinc-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                              <Plus className="h-3 w-3 dark:text-zinc-400" />
                            </button>
                          </div>
                          <p className="text-sm font-bold dark:text-white">
                            {formatPrice(parsePrice(item.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#F5F5F5] dark:border-zinc-800 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-[#666666] dark:text-zinc-400">Subtotal</span>
                  <span className="text-xl font-bold dark:text-white">{subtotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/cart" className="w-full" onClick={() => setIsCartOpen(false)}>
                    <Button variant="secondary" className="w-full">View Bag</Button>
                  </Link>
                  <Link to="/checkout" className="w-full" onClick={() => setIsCartOpen(false)}>
                    <Button className="w-full">
                      Checkout <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
