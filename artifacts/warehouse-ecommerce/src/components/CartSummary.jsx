import React, { useState } from 'react';
import { FaShoppingCart, FaTrash, FaCreditCard, FaLock } from 'react-icons/fa';

const CartSummary = ({ cart, products, onRemoveFromCart, onClearCart, onCheckout }) => {
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return null;
    return { ...product, quantity: qty, total: product.pricePerUnit * qty };
  }).filter(item => item !== null);

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = total > 500 ? 0 : 25;

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="bg-gray-900 text-white p-4 rounded-t border-b border-gray-800 flex justify-between items-center shrink-0">
        <h2 className="font-bold text-base tracking-wide uppercase flex items-center gap-2">
          <FaShoppingCart /> Order Summary
        </h2>
        <span className="bg-gray-800 text-xs font-bold px-2 py-1 rounded">
          {itemCount} ITEMS
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-shopping-basket text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500 text-sm font-medium">Cart is currently empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 pr-2">
                  <p className="font-bold text-gray-900 text-xs uppercase tracking-wide truncate" title={item.name}>{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                    {item.quantity} × R{item.pricePerUnit.toFixed(2)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">R{item.total.toFixed(2)}</p>
                  <button 
                    onClick={() => onRemoveFromCart(item.id, 1)}
                    className="text-[10px] text-red-500 hover:text-red-700 uppercase font-bold tracking-wider mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                {deliveryFee === 0 ? 'FREE' : `R${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-900 font-black text-lg pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>R{(total + deliveryFee).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onCheckout(cartItems, total + deliveryFee)}
              className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
            >
              <FaLock className="text-xs" /> Secure Checkout
            </button>
            <button 
              onClick={onClearCart}
              className="w-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-2 rounded transition-colors text-xs uppercase tracking-wider"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;