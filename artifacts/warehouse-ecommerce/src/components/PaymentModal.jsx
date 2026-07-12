import React, { useEffect, useState } from 'react';
import { FaTimes, FaCreditCard, FaBuilding, FaLock, FaCheckCircle, FaMoneyCheckAlt } from 'react-icons/fa';
import AddressPicker from './AddressPicker';

const PaymentModal = ({
  isOpen,
  onClose,
  orderSummary,
  total,
  onPaymentSuccess,
  initialCustomerName = '',
  initialCustomerEmail = ''
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '', expiry: '', cvv: '',
    name: initialCustomerName, email: initialCustomerEmail,
    address: '', city: '', zip: '', latitude: null, longitude: null
  });

  useEffect(() => {
    if (!isOpen) return;
    setPaymentMethod('card');
    setStep(1);
    setError('');
    setFormData({
      cardNumber: '', expiry: '', cvv: '',
      name: initialCustomerName, email: initialCustomerEmail,
      address: '', city: '', zip: '', latitude: null, longitude: null
    });
  }, [initialCustomerEmail, initialCustomerName, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    const { name, email, address, city, zip, cardNumber, expiry, cvv } = formData;
    if (!name.trim() || !email.trim() || !address.trim() || !city.trim() || !zip.trim()) {
      setError('Please provide complete delivery details.');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !expiry.trim() || !cvv.trim())) {
      setError('Please provide complete card details.');
      return;
    }

    const shippingAddress = [address.trim(), city.trim(), zip.trim()].filter(Boolean).join(', ');
    setError('');
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(async () => {
        try {
          await onPaymentSuccess({
            customerName: name.trim(), customerEmail: email.trim(),
            shippingAddress, shippingLatitude: formData.latitude, shippingLongitude: formData.longitude,
            paymentMethod, paymentStatus: 'paid'
          });
          onClose();
          setStep(1);
        } catch (err) {
          setError(err.message || 'Error processing payment.');
          setStep(1);
        }
      }, 1500);
    }, 1500);
  };

  const renderContent = () => {
    if (step === 2) {
      return (
        <div className="text-center py-16">
          <i className="fas fa-circle-notch fa-spin text-4xl text-brand-700 mb-4"></i>
          <h3 className="text-lg font-bold text-gray-900">Processing Payment</h3>
          <p className="text-sm text-gray-500 mt-2">Authorizing transaction, please wait...</p>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="text-center py-16">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Payment Approved</h3>
          <p className="text-sm text-gray-600 mt-2">Order Confirmed: #{Date.now().toString().slice(-6)}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Payment Method */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`payment-card p-3 flex flex-col items-center justify-center gap-2 ${paymentMethod === 'card' ? 'selected' : ''}`}
              >
                <FaCreditCard className={paymentMethod === 'card' ? 'text-brand-700' : 'text-gray-400'} />
                <span className="text-xs font-bold uppercase">Credit/Debit</span>
              </button>
              <button
                onClick={() => setPaymentMethod('eft')}
                className={`payment-card p-3 flex flex-col items-center justify-center gap-2 ${paymentMethod === 'eft' ? 'selected' : ''}`}
              >
                <FaBuilding className={paymentMethod === 'eft' ? 'text-brand-700' : 'text-gray-400'} />
                <span className="text-xs font-bold uppercase">EFT / Wire</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-4 space-y-3 bg-gray-50 p-4 border border-gray-200 rounded">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Card Number</label>
                  <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} className="input-field py-2" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expiry</label>
                    <input type="text" name="expiry" value={formData.expiry} onChange={handleInputChange} className="input-field py-2" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CVV</label>
                    <input type="text" name="cvv" value={formData.cvv} onChange={handleInputChange} className="input-field py-2" placeholder="123" />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'eft' && (
              <div className="mt-4 bg-blue-50 p-4 border border-blue-200 rounded text-sm text-blue-800 flex items-start gap-3">
                <FaMoneyCheckAlt className="mt-0.5 shrink-0" />
                <p>Upon order confirmation, an invoice with banking details will be emailed. Order ships once funds clear.</p>
              </div>
            )}
          </section>

          {/* Delivery Details */}
          <section>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Delivery Information</h4>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Receiver Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field py-2" placeholder="Store Contact" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field py-2" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Find on Map (Optional)</label>
                <AddressPicker
                  value={{
                    address: formData.address, city: formData.city, zip: formData.zip,
                    latitude: formData.latitude, longitude: formData.longitude,
                    displayAddress: [formData.address, formData.city, formData.zip].filter(Boolean).join(', ')
                  }}
                  onChange={(loc) => {
                    setError('');
                    setFormData(prev => ({
                      ...prev,
                      address: loc.address || prev.address, city: loc.city || prev.city,
                      zip: loc.zip || prev.zip, latitude: loc.latitude ?? prev.latitude, longitude: loc.longitude ?? prev.longitude
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field py-2" placeholder="123 Industrial Way" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-field py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postal Code</label>
                  <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="input-field py-2" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary sidebar in modal */}
        <div className="lg:w-72 bg-gray-50 border border-gray-200 rounded p-4 flex flex-col">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Summary</h4>
          <div className="text-sm text-gray-600 space-y-2 mb-4 flex-1">
            <div className="flex justify-between">
              <span>Lines:</span>
              <span className="font-bold text-gray-900">{orderSummary.length}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <button onClick={handlePayment} className="w-full btn-primary bg-accent-600 hover:bg-accent-700 py-3 uppercase tracking-wider text-sm flex items-center justify-center gap-2">
            <FaLock /> Confirm & Pay
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:p-4 modal-overlay bg-gray-900/75">
      <div className="bg-white w-full h-[100dvh] lg:h-auto lg:rounded-lg lg:max-w-4xl lg:max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-4 py-4 lg:px-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-lg lg:text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            Secure Checkout
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2">
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-4 lg:p-6 overflow-y-auto flex-1 bg-white lg:bg-transparent">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;