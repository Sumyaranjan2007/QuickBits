import React, { createContext, useContext, useState, useCallback } from 'react';
import { cartApi } from '@quickbite/api-client';

interface CartItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemPrice: number;
  quantity: number;
  addons: string[];
  specialInstructions: string | null;
  itemTotal: number;
}

interface Cart {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  platformFee: number;
  total: number;
  itemCount: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (data: { restaurantId: string; menuItemId: string; quantity?: number; addons?: string[] }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await cartApi.get();
      setCart(res.data as Cart);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(async (data: { restaurantId: string; menuItemId: string; quantity?: number; addons?: string[] }) => {
    await cartApi.addItem({ ...data, quantity: data.quantity || 1 });
    await refreshCart();
  }, [refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await cartApi.removeItem(itemId);
    } else {
      await cartApi.updateItem(itemId, { quantity });
    }
    await refreshCart();
  }, [refreshCart]);

  const removeItem = useCallback(async (itemId: string) => {
    await cartApi.removeItem(itemId);
    await refreshCart();
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setCart(null);
  }, []);

  return (
    <CartContext.Provider value={{ cart, isLoading, refreshCart, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
