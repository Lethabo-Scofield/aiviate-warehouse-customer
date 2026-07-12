import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { orderService } from '../services/orderService';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeOrder = useCallback((order) => {
    const items = Array.isArray(order?.items)
      ? order.items.map((item) => {
          const quantity = Number(item?.quantity ?? 0);
          const pricePerUnit = Number(item?.pricePerUnit ?? item?.unitPrice ?? item?.unit_price ?? item?.price ?? 0);
          const total = Number(item?.total ?? item?.lineTotal ?? item?.line_total ?? (quantity * pricePerUnit) ?? 0);
          return {
            ...item,
            name: item?.name || item?.productName || item?.product_name || 'Unnamed Item',
            quantity,
            pricePerUnit,
            total
          };
        })
      : [];

    return {
      ...order,
      id: order?.id,
      date: order?.date || order?.created_at || new Date().toISOString(),
      status: order?.status || 'confirmed',
      total: Number(order?.total ?? 0),
      shippingAddress: order?.shippingAddress || order?.shipping_address || '',
      shippingLatitude: Number(order?.shippingLatitude ?? order?.shipping_latitude ?? 0) || null,
      shippingLongitude: Number(order?.shippingLongitude ?? order?.shipping_longitude ?? 0) || null,
      items
    };
  }, []);

  const mergeOrders = useCallback((primaryOrders, fallbackOrders) => {
    const map = new Map();

    [...fallbackOrders, ...primaryOrders].forEach((order) => {
      const normalized = normalizeOrder(order);
      const key = String(normalized.id);
      map.set(key, normalized);
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [normalizeOrder]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orderHistory');
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed.map(normalizeOrder));
        }
      } catch (e) {
        console.error('Error loading orders from localStorage:', e);
      }
    }
  }, [normalizeOrder]);

  useEffect(() => {
    const loadBackendOrders = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getOrders();
        const backendOrders = Array.isArray(response?.orders) ? response.orders : [];
        setOrders((prev) => mergeOrders(backendOrders, prev));
      } catch (err) {
        console.error('Error loading backend orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBackendOrders();
  }, [isAuthenticated, mergeOrders]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orders));
  }, [orders]);

  // Add a new order
  const addOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: orderData.items || [],
        total: orderData.total || 0,
        status: 'confirmed',
        ...orderData
      };

      if (isAuthenticated) {
        const payload = {
          ...orderData,
          items: (orderData.items || []).map((item) => ({
            ...item,
            unitPrice: Number(item.pricePerUnit ?? item.unitPrice ?? item.price ?? 0),
            quantity: Number(item.quantity ?? 1)
          }))
        };

        const created = await orderService.createOrder(payload);
        const createdId = created?.order?.id;

        if (createdId) {
          const detail = await orderService.getOrderById(createdId);
          const backendOrder = normalizeOrder(detail?.order || created.order);
          setOrders((prev) => mergeOrders([backendOrder], prev));
          return backendOrder;
        }
      }

      setOrders(prev => [newOrder, ...prev]);

      return newOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        await orderService.updateOrderStatus(orderId, status);
      }

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderAddress = async (orderId, addressData) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await orderService.updateOrderAddress(orderId, addressData);
        const updatedOrderFields = response?.order || {};

        setOrders((prev) => prev.map((order) => {
          if (String(order.id) !== String(orderId)) {
            return order;
          }

          return normalizeOrder({
            ...order,
            shipping_address: updatedOrderFields.shipping_address ?? addressData.shippingAddress,
            shipping_latitude: updatedOrderFields.shipping_latitude ?? addressData.shippingLatitude,
            shipping_longitude: updatedOrderFields.shipping_longitude ?? addressData.shippingLongitude
          });
        }));

        return true;
      }

      setOrders((prev) => prev.map((order) => (
        String(order.id) === String(orderId)
          ? {
              ...order,
              shippingAddress: addressData.shippingAddress,
              shippingLatitude: addressData.shippingLatitude ?? null,
              shippingLongitude: addressData.shippingLongitude ?? null
            }
          : order
      )));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status?.toLowerCase() === status.toLowerCase());
  };

  // Delete order (admin only)
  const deleteOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      setOrders(prev => prev.filter(order => order.id !== orderId));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear all orders
  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem('orderHistory');
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      addOrder,
      updateOrderStatus,
      updateOrderAddress,
      getOrderById,
      getOrdersByStatus,
      deleteOrder,
      clearOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};