import React, { useEffect, useState } from 'react';
import { FaTimes, FaCreditCard, FaPaypal, FaUniversity, FaLock, FaCheckCircle } from 'react-icons/fa';
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
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: initialCustomerName,
    email: initialCustomerEmail,
    address: '',
    city: '',
    zip: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPaymentMethod('card');
    setStep(1);
    setError('');
    setFormData({
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: initialCustomerName,
      email: initialCustomerEmail,
      address: '',
      city: '',
      zip: '',
      latitude: null,
      longitude: null
    });
  }, [initialCustomerEmail, initialCustomerName, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const zip = formData.zip.trim();

    if (!name || !email || !address || !city || !zip) {
      setError('Please enter your full delivery details before confirming the order.');
      return;
    }

    if (paymentMethod === 'card' && (!formData.cardNumber.trim() || !formData.expiry.trim() || !formData.cvv.trim())) {
      setError('Please complete your card details before confirming the order.');
      return;
    }

    const shippingAddress = [address, city, zip].filter(Boolean).join(', ');

    // Simulate payment processing
    setError('');
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(async () => {
        try {
          await onPaymentSuccess({
            customerName: name,
            customerEmail: email,
            shippingAddress,
            shippingLatitude: formData.latitude,
            shippingLongitude: formData.longitude,
            paymentMethod,
            paymentStatus: 'paid'
          });
          onClose();
          setStep(1);
        } catch (paymentError) {
          setError(paymentError.message || 'Unable to confirm your order right now.');
          setStep(1);
        }
      }, 2000);
    }, 1500);
  };

  const renderPaymentForm = () => {
    if (step === 2) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Processing your payment...</p>
          <p className="text-sm text-gray-400">Please don't close this window</p>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="text-center py-12">
          <div className="text-green-500 text-6xl mb-4">
            <FaCheckCircle className="mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
          <p className="text-gray-600 mt-2">Your order has been confirmed</p>
          <p className="text-sm text-gray-400 mt-1">Order #BULK-{Date.now().toString().slice(-6)}</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`payment-card p-4 rounded-xl border-2 ${
              paymentMethod === 'card' ? 'selected' : 'border-gray-200'
            }`}
          >
            <FaCreditCard className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium">Credit Card</p>
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`payment-card p-4 rounded-xl border-2 ${
              paymentMethod === 'paypal' ? 'selected' : 'border-gray-200'
            }`}
          >
            <FaPaypal className="text-2xl mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">PayPal</p>
          </button>
          <button
            onClick={() => setPaymentMethod('bank')}
            className={`payment-card p-4 rounded-xl border-2 ${
              paymentMethod === 'bank' ? 'selected' : 'border-gray-200'
            }`}
          >
            <FaUniversity className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium">Bank Transfer</p>
          </button>
        </div>

        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>
        )}

        {(paymentMethod === 'paypal' || paymentMethod === 'bank') && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">
              <i className="fas fa-info-circle mr-2"></i>
              You will be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 'your bank'} to complete the payment.
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="bg-white border border-slate-200 p-4 rounded-xl mb-4 space-y-4">
            <h4 className="font-semibold text-gray-700">Delivery Address</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <AddressPicker
              value={{
                address: formData.address,
                city: formData.city,
                zip: formData.zip,
                latitude: formData.latitude,
                longitude: formData.longitude,
                displayAddress: [formData.address, formData.city, formData.zip].filter(Boolean).join(', ')
              }}
              onChange={(nextLocation) => {
                setError('');
                setFormData((prev) => ({
                  ...prev,
                  address: nextLocation.address || prev.address,
                  city: nextLocation.city || prev.city,
                  zip: nextLocation.zip || prev.zip,
                  latitude: nextLocation.latitude ?? prev.latitude,
                  longitude: nextLocation.longitude ?? prev.longitude
                }));
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Johannesburg"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="zip"
                  placeholder="2000"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span>{orderSummary.length} products</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-teal-700">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            className="w-full btn-success-gradient text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            <FaLock />
            Pay R{total.toFixed(2)}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCreditCard className="text-teal-700" />
            Payment
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        <div className="p-6">
          {renderPaymentForm()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;