
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MerchandiseItem } from '@/lib/merchandise';

export interface CartItem extends MerchandiseItem {
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MerchandiseItem & { selectedSize: string }) => void;
  removeFromCart: (itemId: number, size: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (itemToAdd: MerchandiseItem & { selectedSize: string }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === itemToAdd.id && item.selectedSize === itemToAdd.selectedSize
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id && item.selectedSize === itemToAdd.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number, size: string) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === itemId && item.selectedSize === size)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
