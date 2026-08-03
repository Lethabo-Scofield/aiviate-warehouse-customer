import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, cartQuantity }) => {
  const [quantity, setQuantity] = useState(product.minOrder || 1);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16" font-family="Arial">No Image Provided</text></svg>';

  const handleAdd = () => {
    const finalQty = Math.max(1, Math.floor(quantity));
    if (finalQty < (product.minOrder || 1)) {
      alert(`Minimum order quantity is ${product.minOrder} ${product.unit}(s).`);
      return;
    }
    if ((cartQuantity + finalQty) > (product.stock || 100)) {
      alert(`Insufficient stock. Available: ${product.stock}`);
      return;
    }
    onAddToCart(product.id, finalQty);
    setQuantity(product.minOrder || 1);
  };

  const getImageUrl = () => {
    if (imageError || !product.image) return fallbackImage;
    return product.image;
  };

  return (
    <div className="card-retail flex flex-col h-full relative group">
      {/* Product Image Area */}
      <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-center items-center bg-white h-28 sm:h-40 relative">
        <img 
          src={getImageUrl()}
          alt={product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply"
          onError={() => setImageError(true)}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.nutriscore && product.nutriscore !== 'N/A' && (
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-gray-900 uppercase tracking-wide">
              NutriScore {product.nutriscore}
            </span>
          )}
        </div>
        {product.stock && product.stock < 15 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            Low Stock
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1 gap-1">
          <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold truncate">
            {product.brand && product.brand !== 'Generic' ? product.brand : 'Wholesale'}
          </p>
          <span className="hidden sm:inline text-[10px] text-gray-400 font-mono shrink-0">
            {product.barcode ? `#${product.barcode.slice(-6)}` : `ID:${product.id}`}
          </span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2" title={product.name}>
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-end gap-1 mb-2.5 sm:mb-3 flex-wrap">
            <span className="text-base sm:text-lg font-black text-gray-900">R{(product.pricePerUnit || 0).toFixed(2)}</span>
            <span className="text-xs text-gray-500 mb-1 font-medium">/ {product.unit || 'unit'}</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded overflow-hidden w-14 sm:w-24 h-10 sm:h-11 shrink-0">
                <input 
                  type="number" 
                  min={product.minOrder || 1} 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(product.minOrder || 1, parseInt(e.target.value) || 1))}
                  className="w-full h-full text-center text-base font-bold outline-none text-gray-900 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-gray-50"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white h-10 sm:h-11 rounded text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm min-w-0"
              >
                <i className="fas fa-plus text-xs"></i> ADD
              </button>
            </div>
            
            <div className="flex justify-between items-center h-5">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                Min Qty: {product.minOrder || 1}
              </span>
              {cartQuantity > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  <span>{cartQuantity} IN CART</span>
                  <i 
                    className="fas fa-times cursor-pointer hover:text-red-600 ml-1"
                    onClick={() => {
                      if (window.confirm('Remove items from cart?')) {
                        onAddToCart(product.id, -cartQuantity);
                      }
                    }}
                    title="Remove"
                  ></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;