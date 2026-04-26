import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItemResponse, CartResponse } from '../types';
import { cartService, cartItemService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { parsePrice } from '../utils';

// Local cart item shape (used when not logged in)
export interface LocalCartItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItemResponse[];
  localItems: LocalCartItem[];
  totalPrice: string;
  itemCount: number;
  isCartOpen: boolean;
  isLoading: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (productId: number, productName: string, productImageUrl: string, unitPrice: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'pb_local_cart';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [totalPrice, setTotalPrice] = useState('0.00');
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load local cart from storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    if (saved) {
      try { setLocalItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Persist local cart
  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(localItems));
  }, [localItems]);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const cart: CartResponse = await cartService.getCart();
      setCartItems(cart.cartItems);
      setTotalPrice(cart.totalPrice);
    } catch {
      // Session expired; cart state stays empty
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // When user logs in — merge local cart into server cart, then refresh
  useEffect(() => {
    if (user) {
      const migrateAndLoad = async () => {
        if (localItems.length > 0) {
          try {
            await cartService.populateFromLocal(
              localItems.map(i => ({ productId: i.productId, quantity: i.quantity }))
            );
            setLocalItems([]);
            localStorage.removeItem(LOCAL_CART_KEY);
          } catch { /* ignore errors during migration */ }
        }
        await refreshCart();
      };
      migrateAndLoad();
    } else {
      // Logged out — clear server cart state
      setCartItems([]);
      setTotalPrice('0.00');
    }
  }, [user]);

  const addItem = async (
    productId: number,
    productName: string,
    productImageUrl: string,
    unitPrice: string,
    quantity = 1
  ) => {
    if (user) {
      await cartItemService.addItem(productId, quantity);
      await refreshCart();
    } else {
      setLocalItems(prev => {
        const existing = prev.find(i => i.productId === productId);
        if (existing) {
          return prev.map(i =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { productId, productName, productImageUrl, unitPrice, quantity }];
      });
    }
  };

  const removeItem = async (cartItemId: number) => {
    if (user) {
      await cartItemService.removeItem(cartItemId);
      await refreshCart();
    } else {
      setLocalItems(prev => prev.filter(i => i.productId !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    if (user) {
      await cartItemService.updateItem(cartItemId, quantity);
      await refreshCart();
    } else {
      setLocalItems(prev =>
        prev.map(i => (i.productId === cartItemId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      await cartService.clearCart();
      setCartItems([]);
      setTotalPrice('0.00');
    } else {
      setLocalItems([]);
    }
  };

  const itemCount = user
    ? cartItems.reduce((sum, i) => sum + i.quantity, 0)
    : localItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        localItems,
        totalPrice,
        itemCount,
        isCartOpen,
        isLoading,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
