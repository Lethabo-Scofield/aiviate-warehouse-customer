import React, { useState } from 'react';
import { FaShoppingCart, FaTrash, FaCreditCard, FaTruck } from 'react-icons/fa';

const CartSummary = ({ cart, products, onRemoveFromCart, onClearCart, onCheckout }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return null;
    return { ...product, quantity: qty, total: product.pricePerUnit * qty };
  }).filter(item => item !== null);

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = total > 500 ? 0 : 25;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 sticky top-4">
      <div 
        className="bg-gradient-to-r from-teal-700 to-cyan-700 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <FaShoppingCart className="text-2xl" />
            <div>
              <h2 className="font-bold text-lg">Your Order</h2>
              <p className="text-sm opacity-90">{itemCount} items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              R{total.toFixed(2)}
            </span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} transition-transform`}></i>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">🛒</div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400">Start adding bulk items!</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × R{item.pricePerUnit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-bold text-teal-700 text-sm">
                        R{item.total.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => onRemoveFromCart(item.id, 1)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `R${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {deliveryFee === 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    <i className="fas fa-gift mr-1"></i> Free delivery for orders over R500
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-teal-700">R{(total + deliveryFee).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => onCheckout(cartItems, total + deliveryFee)}
                  disabled={cartItems.length === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    cartItems.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'btn-success-gradient text-white hover:shadow-lg'
                  }`}
                >
                  <FaCreditCard />
                  Checkout
                </button>
                <button 
                  onClick={onClearCart}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-xl transition-all"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaTruck />
                <span>Bulk delivery in 2-3 business days</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartSummary;