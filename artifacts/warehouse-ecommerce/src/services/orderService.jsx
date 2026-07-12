import { apiRequest } from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders (authenticated)
  getOrders: async () => {
    try {
      return await apiRequest('/orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    try {
      return await apiRequest(`/orders/${id}`);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return response;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  updateOrderAddress: async (id, addressData) => {
    try {
      return await apiRequest(`/orders/${id}/address`, {
        method: 'PATCH',
        body: JSON.stringify(addressData)
      });
    } catch (error) {
      console.error(`Error updating order address ${id}:`, error);
      throw error;
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await apiRequest('/payment', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      return response;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
};