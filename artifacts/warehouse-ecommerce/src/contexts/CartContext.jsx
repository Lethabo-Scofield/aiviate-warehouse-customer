import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { orderService } from '../services/orderService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const addToCart = (productId, quantity) => {
    if (quantity <= 0) return;
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId, quantity = 1) => {
    setCart(prev => {
      const existing = prev[productId] || 0;
      const newQty = Math.max(0, existing - quantity);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const clearCart = () => setCart({});

  const placeOrder = useCallback(async (orderData, products) => {
    try {
      setIsProcessingPayment(true);
      
      // Format order for API
      const formattedOrder = {
        items: orderData.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.pricePerUnit,
          total: item.total
        })),
        total: orderData.reduce((sum, item) => sum + item.total, 0),
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      // Send order to API
      const response = await orderService.createOrder(formattedOrder);
      
      // Save to local order history
      const order = {
        id: response.id || Date.now(),
        date: new Date().toISOString(),
        items: orderData,
        total: formattedOrder.total,
        status: 'confirmed'
      };
      
      setOrderHistory(prev => [order, ...prev]);
      setCart({});
      setIsProcessingPayment(false);
      
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessingPayment(false);
      throw error;
    }
  }, []);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      placeOrder,
      orderHistory,
      cartCount,
      isProcessingPayment
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};