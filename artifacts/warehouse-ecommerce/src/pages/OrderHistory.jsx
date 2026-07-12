import React, { useState } from 'react';
import { FaHistory, FaCheckCircle, FaClock, FaTruck, FaBox, FaSearch, FaFilter, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import AddressPicker from '../components/AddressPicker';

const OrderHistory = ({ orders = [], onUpdateOrderAddress }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address: '', city: '', zip: '', latitude: null, longitude: null
  });
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-green-100 text-green-800 border border-green-200">CONFIRMED</span>;
      case 'pending':
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">PENDING</span>;
      case 'shipped':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">SHIPPED</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-red-100 text-red-800 border border-red-200">CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{status?.toUpperCase() || 'UNKNOWN'}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const startEditingAddress = (order) => {
    setEditingOrderId(order.id);
    setAddressError('');
    const segments = String(order.shippingAddress || '').split(',').map((s) => s.trim()).filter(Boolean);
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
      setAddressError('Please provide complete address details.');
      return;
    }
    try {
      setSavingAddress(true);
      await onUpdateOrderAddress(orderId, {
        shippingAddress,
        shippingLatitude: addressForm.latitude,
        shippingLongitude: addressForm.longitude
      });
      setEditingOrderId(null);
    } catch (error) {
      setAddressError(error.message || 'Unable to update address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status?.toLowerCase() !== filter) return false;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return order.id?.toString().includes(lower) || order.items?.some(i => i.name?.toLowerCase().includes(lower));
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h2>
          <p className="text-sm text-gray-500 mt-1">Review past orders and track current shipments</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search ID or Product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded text-sm w-48 focus:ring-1 focus:ring-brand-700 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-brand-700 outline-none bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded">
          <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
          <h3 className="text-lg font-bold text-gray-900">No Order History</h3>
          <p className="text-gray-500 text-sm mt-1">Your past bulk purchases will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order Placed</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</p>
                    <p className="text-sm font-medium text-gray-900">${order.total?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order #</p>
                    <p className="text-sm font-medium text-gray-900">{order.id?.toString().slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Items</h4>
                  <ul className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs overflow-hidden">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <i className="fas fa-box text-gray-400"></i>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-gray-500 text-xs">Qty: {item.quantity} @ ${(item.pricePerUnit || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">${(item.total || 0).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Delivery Address</h4>
                    {['pending', 'confirmed'].includes(String(order.status || '').toLowerCase()) && (
                      <button 
                        onClick={() => startEditingAddress(order)}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>
                  
                  {editingOrderId === order.id ? (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm space-y-3 mt-2">
                       <AddressPicker
                          value={{
                            address: addressForm.address,
                            city: addressForm.city,
                            zip: addressForm.zip,
                            latitude: addressForm.latitude,
                            longitude: addressForm.longitude,
                            displayAddress: [addressForm.address, addressForm.city, addressForm.zip].filter(Boolean).join(', ')
                          }}
                          onChange={(loc) => {
                            setAddressError('');
                            setAddressForm(prev => ({
                              ...prev,
                              address: loc.address || prev.address,
                              city: loc.city || prev.city,
                              zip: loc.zip || prev.zip,
                              latitude: loc.latitude ?? prev.latitude,
                              longitude: loc.longitude ?? prev.longitude
                            }));
                          }}
                        />
                        <input className="input-field py-1.5" placeholder="Street" value={addressForm.address} onChange={(e) => setAddressForm(p => ({...p, address: e.target.value}))}/>
                        <div className="flex gap-2">
                           <input className="input-field py-1.5 w-2/3" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm(p => ({...p, city: e.target.value}))}/>
                           <input className="input-field py-1.5 w-1/3" placeholder="ZIP" value={addressForm.zip} onChange={(e) => setAddressForm(p => ({...p, zip: e.target.value}))}/>
                        </div>
                        {addressError && <p className="text-red-600 text-xs font-medium">{addressError}</p>}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleSaveAddress(order.id)} disabled={savingAddress} className="btn-primary py-1 px-3 text-xs w-full">Save</button>
                          <button onClick={() => setEditingOrderId(null)} className="btn-outline py-1 px-3 text-xs">Cancel</button>
                        </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                      {order.shippingAddress || 'No address provided'}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button className="btn-outline w-full text-xs py-1.5">
                      <i className="fas fa-file-invoice mr-2"></i> Download Invoice
                    </button>
                    <button className="btn-primary bg-gray-800 hover:bg-gray-900 w-full text-xs py-1.5">
                      <i className="fas fa-sync-alt mr-2"></i> Reorder Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;