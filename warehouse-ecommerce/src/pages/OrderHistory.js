import React, { useState } from 'react';
import { 
  FaHistory, 
  FaCheckCircle, 
  FaClock, 
  FaTruck, 
  FaBox,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaEdit
} from 'react-icons/fa';
import AddressPicker from '../components/AddressPicker';

const OrderHistory = ({ orders = [], onUpdateOrderAddress }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    zip: '',
    latitude: null,
    longitude: null
  });
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      case 'pending':
      case 'processing':
        return <FaClock className="text-yellow-600" />;
      case 'shipped':
        return <FaTruck className="text-purple-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const startEditingAddress = (order) => {
    setEditingOrderId(order.id);
    setAddressError('');

    const segments = String(order.shippingAddress || '').split(',').map((segment) => segment.trim()).filter(Boolean);
    setAddressForm({
      address: segments[0] || order.shippingAddress || '',
      city: segments[1] || '',
      zip: segments[2] || '',
      latitude: order.shippingLatitude ?? null,
      longitude: order.shippingLongitude ?? null
    });
  };

  const handleSaveAddress = async (orderId) => {
    const shippingAddress = [addressForm.address, addressForm.city, addressForm.zip].filter(Boolean).join(', ');

    if (!shippingAddress || !addressForm.address || !addressForm.city || !addressForm.zip) {
      setAddressError('Select the address from the map and complete the address fields before saving.');
      return;
    }

    try {
      setSavingAddress(true);
      setAddressError('');
      await onUpdateOrderAddress(orderId, {
        shippingAddress,
        shippingLatitude: addressForm.latitude,
        shippingLongitude: addressForm.longitude
      });
      setEditingOrderId(null);
    } catch (error) {
      setAddressError(error.message || 'Unable to update the order address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filter !== 'all' && order.status?.toLowerCase() !== filter) {
      return false;
    }
    
    // Search by order ID or items
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatch = order.id?.toString().includes(searchLower);
      const itemMatch = order.items?.some(item => 
        item.name?.toLowerCase().includes(searchLower)
      );
      return orderIdMatch || itemMatch;
    }
    
    return true;
  });

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Start shopping to see your order history here</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-teal-700" />
            Order History
          </h2>
          <p className="text-sm text-gray-500">View all your bulk orders</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-full sm:w-48"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none appearance-none w-full sm:w-auto"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">No orders match your search</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Order Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-medium capitalize">{order.status || 'Pending'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.id?.toString().slice(-8) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-teal-700">
                        ${order.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-semibold">{order.items?.length || 0}</p>
                    </div>
                    <div className="text-gray-400">
                      {expandedOrder === order.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50 animate-slide-in">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{item.image || '📦'}</span>
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} × ${item.pricePerUnit?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                            <div className="font-bold text-teal-700">
                              ${item.total?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-xl">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Delivery</p>
                          <p className="font-semibold text-green-600">FREE</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Order Date</p>
                          <p className="font-semibold text-sm">{formatDate(order.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status || 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Delivery Address</p>
                          <p className="font-semibold text-gray-800 flex items-start gap-2">
                            <FaMapMarkerAlt className="text-teal-700 mt-1" />
                            <span>{order.shippingAddress || 'No address saved yet'}</span>
                          </p>
                        </div>
                        {['pending', 'confirmed', 'processing'].includes(String(order.status || '').toLowerCase()) && (
                          <button
                            onClick={() => startEditingAddress(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2"
                          >
                            <FaEdit />
                            Edit Address
                          </button>
                        )}
                      </div>

                      {editingOrderId === order.id && (
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4">
                          <AddressPicker
                            value={{
                              address: addressForm.address,
                              city: addressForm.city,
                              zip: addressForm.zip,
                              latitude: addressForm.latitude,
                              longitude: addressForm.longitude,
                              displayAddress: [addressForm.address, addressForm.city, addressForm.zip].filter(Boolean).join(', ')
                            }}
                            onChange={(nextLocation) => {
                              setAddressError('');
                              setAddressForm((prev) => ({
                                ...prev,
                                address: nextLocation.address || prev.address,
                                city: nextLocation.city || prev.city,
                                zip: nextLocation.zip || prev.zip,
                                latitude: nextLocation.latitude ?? prev.latitude,
                                longitude: nextLocation.longitude ?? prev.longitude
                              }));
                            }}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={addressForm.address}
                              onChange={(event) => setAddressForm((prev) => ({ ...prev, address: event.target.value }))}
                              placeholder="Street address"
                              className="input-field"
                            />
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                              placeholder="City"
                              className="input-field"
                            />
                            <input
                              type="text"
                              value={addressForm.zip}
                              onChange={(event) => setAddressForm((prev) => ({ ...prev, zip: event.target.value }))}
                              placeholder="Postal code"
                              className="input-field"
                            />
                          </div>

                          {addressError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                              {addressError}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleSaveAddress(order.id)}
                              disabled={savingAddress}
                              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                            >
                              {savingAddress ? 'Saving...' : 'Save Address'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrderId(null);
                                setAddressError('');
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {order.status?.toLowerCase() === 'pending' && (
                        <button className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl transition-colors text-sm">
                          Cancel Order
                        </button>
                      )}
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors text-sm">
                        Download Invoice
                      </button>
                      <button className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-xl transition-colors text-sm">
                        Reorder Items
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-teal-700">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status?.toLowerCase() === 'confirmed' || o.status?.toLowerCase() === 'completed').length}
            </p>
            <p className="text-sm text-gray-500">Completed Orders</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
            </p>
            <p className="text-sm text-gray-500">Pending Orders</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;