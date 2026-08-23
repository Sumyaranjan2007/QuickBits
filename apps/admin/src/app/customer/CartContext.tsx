'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '@quickbite/api-client';

export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique item key
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodType: string;
  imageUrl?: string;
  restaurantId: string;
  restaurantName: string;
  addons?: CartItemAddon[];
  specialInstructions?: string;
}

export interface AppliedCoupon {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  tip: number;
  setTip: (tip: number) => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  total: number;
  totalSavings: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [tip, setTip] = useState<number>(20);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qb_customer_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
        setRestaurantName(parsed.restaurantName || null);
        if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
      }
    } catch {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qb_customer_cart', JSON.stringify({
        items,
        restaurantId,
        restaurantName,
        appliedCoupon,
      }));
    } catch {}
  }, [items, restaurantId, restaurantName, appliedCoupon]);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    // If cart has items from another restaurant, reset cart or ask
    if (restaurantId && restaurantId !== newItem.restaurantId && items.length > 0) {
      if (!confirm(`Your cart contains items from "${restaurantName}". Reset your cart to add items from "${newItem.restaurantName}"?`)) {
        return;
      }
      setItems([]);
      setAppliedCoupon(null);
    }

    setRestaurantId(newItem.restaurantId);
    setRestaurantName(newItem.restaurantName);

    const key = `${newItem.menuItemId}-${(newItem.addons || []).map(a => a.id).sort().join('-')}`;

    setItems(prev => {
      const existingIndex = prev.findIndex(it => it.id === key);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += (newItem.quantity || 1);
        return copy;
      } else {
        return [...prev, { ...newItem, id: key, quantity: newItem.quantity || 1 }];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => {
      return prev.map(it => {
        if (it.id === id) {
          const newQty = it.quantity + delta;
          return newQty > 0 ? { ...it, quantity: newQty } : null;
        }
        return it;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setAppliedCoupon(null);
    try { localStorage.removeItem('qb_customer_cart'); } catch {}
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculations
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  const subtotal = items.reduce((acc, it) => {
    const addonsCost = (it.addons || []).reduce((sum, a) => sum + (a.price || 0), 0);
    return acc + ((it.price + addonsCost) * it.quantity);
  }, 0);

  // Free delivery on orders > ₹299
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 299 ? 0 : 35);
  const platformFee = subtotal > 0 ? 5 : 0;
  const taxes = Math.round(subtotal * 0.05); // 5% GST

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = Math.min(Math.round((subtotal * appliedCoupon.value) / 100), 100);
    } else {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + platformFee + taxes + tip - discountAmount);
  const totalSavings = discountAmount + (subtotal >= 299 && subtotal > 0 ? 35 : 0);

  return (
    <CartContext.Provider value={{
      items,
      restaurantId,
      restaurantName,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount,
      subtotal,
      deliveryFee,
      platformFee,
      taxes,
      tip,
      setTip,
      appliedCoupon: appliedCoupon ? { ...appliedCoupon, discountAmount } : null,
      applyCoupon,
      removeCoupon,
      total,
      totalSavings,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
