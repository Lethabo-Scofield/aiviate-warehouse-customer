import React, { useState } from 'react';
import { FaShoppingCart, FaTrash, FaCreditCard, FaLock, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const CartSummary = ({ cart, products, onRemoveFromCart, onClearCart, onCheckout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return null;
    return { ...product, quantity: qty, total: product.pricePerUnit * qty };
  }).filter(item => item !== null);

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = total > 500 ? 0 : 25;

  return (
    <>
      {isExpanded && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsExpanded(false)} />}
      
      <div className={`bg-white rounded border border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${
        isExpanded 
          ? 'fixed top-16 left-0 right-0 z-40 max-h-[80vh] rounded-none rounded-b-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:z-auto lg:rounded lg:shadow-sm' 
          : 'sticky top-16 z-30 h-[60px] lg:top-24 lg:h-auto lg:max-h-[calc(100vh-8rem)] lg:z-auto'
      }`}>
        <div 
          className="bg-gray-900 text-white p-4 lg:rounded-t border-b border-gray-800 flex justify-between items-center shrink-0 cursor-pointer lg:cursor-default h-[60px] lg:h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="font-bold text-base tracking-wide uppercase flex items-center gap-2">
            <FaShoppingCart className="text-lg" /> 
            <span className="hidden lg:inline">Order Summary</span>
            <span className="lg:hidden text-lg">Cart</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-gray-800 text-sm font-bold px-3 py-1.5 rounded flex items-center gap-2">
              <span>{itemCount} ITEMS</span>
              <span className="text-brand-400">|</span>
              <span>R{total.toFixed(2)}</span>
            </span>
            <div className="lg:hidden text-xl text-gray-400">
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto scrollbar-hide flex-col ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-basket text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-base font-medium">Cart is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1 pr-3">
                    <p className="font-bold text-gray-900 text-sm uppercase tracking-wide truncate" title={item.name}>{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1 font-mono">
                      {item.quantity} × R{item.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <p className="font-black text-gray-900 text-base">R{item.total.toFixed(2)}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item.id, 1); }}
                      className="text-xs text-red-500 hover:text-red-700 uppercase font-bold tracking-wider mt-2 py-1 px-2 -mr-2"
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
          <div className={`p-5 bg-gray-50 border-t border-gray-200 shrink-0 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-3 mb-5 text-base">
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
              <div className="flex justify-between text-gray-900 font-black text-xl pt-3 border-t border-gray-200 mt-3">
                <span>Total</span>
                <span>R{(total + deliveryFee).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); onCheckout(cartItems, total + deliveryFee); }}
                className="w-full btn-primary bg-accent-600 hover:bg-accent-700 py-4 text-base shadow-md"
              >
                <FaLock className="text-sm mr-2" /> SECURE CHECKOUT
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onClearCart(); }}
                className="w-full btn-outline py-3 text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSummary;