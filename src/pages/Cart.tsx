import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Minus, Plus, ShoppingBag, Box } from 'lucide-react';
import { Button } from '../components/Button';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, parsePrice } from '../utils';

export const Cart = () => {
  const { user } = useAuth();
  const { cartItems, localItems, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  // Use server cart items if logged in, otherwise local items
  const items = user
    ? cartItems.map((i) => ({
      id: i.cartItemId,
      productId: i.productId,
      name: i.productName,
      imageUrl: i.productImageUrl,
      price: i.unitPrice,
      quantity: i.quantity,
    }))
    : localItems.map((i) => ({
      id: i.productId,
      productId: i.productId,
      name: i.productName,
      imageUrl: i.productImageUrl,
      price: i.unitPrice,
      quantity: i.quantity,
    }));

  const subtotal = user
    ? parsePrice(totalPrice)
    : localItems
      .reduce((sum, i) => sum + parsePrice(i.unitPrice) * i.quantity, 0);

  const formattedSubtotal = formatPrice(subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
        <ShoppingBag className="h-16 w-16 text-[#CCCCCC] mb-6" />
        <h2 className="text-2xl font-serif font-bold dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-[#666666] dark:text-zinc-400 mb-8">
          Discover our curated collection of fragrances.
        </p>
        <Link to="/products">
          <Button size="lg">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold dark:text-white mb-10">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 card-shadow"
              >
                <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-[#F5F5F5] dark:bg-zinc-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Box className="h-6 w-6 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <h3 className="font-semibold dark:text-white text-sm leading-tight">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#CCCCCC] hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#999999] dark:text-zinc-400">{item.price} each</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold dark:text-white text-sm">
                      {formatPrice(parsePrice(item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 card-shadow h-fit">
          <h2 className="font-bold text-lg dark:text-white mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-[#666666] dark:text-zinc-400">
              <span>Subtotal</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between text-[#666666] dark:text-zinc-400">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800" />
            <div className="flex justify-between font-bold text-base dark:text-white">
              <span>Total</span>
              <span>{formattedSubtotal}</span>
            </div>
          </div>

          {user ? (
            <Button className="w-full h-12 rounded-2xl" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full h-12 rounded-2xl"
                onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              >
                Sign in to Checkout
              </Button>
              <p className="text-xs text-center text-[#999999] dark:text-zinc-400">
                Your cart is saved and will be available after sign in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
