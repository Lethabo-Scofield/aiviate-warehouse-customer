import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart, cartQuantity }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="%23ecfeff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%230f766e" font-size="22" font-family="Arial">No Image</text></svg>';

  const handleAdd = () => {
    const finalQty = Math.max(1, Math.floor(quantity));
    if (finalQty < (product.minOrder || 1)) {
      alert(`⚠️ Minimum order for ${product.name} is ${product.minOrder} ${product.unit}(s).`);
      return;
    }
    if ((cartQuantity + finalQty) > (product.stock || 100)) {
      alert(`⚠️ Not enough stock. Available: ${product.stock} ${product.unit}(s)`);
      return;
    }
    onAddToCart(product.id, finalQty);
    setQuantity(1);
  };

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 inline" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400 inline" />);
    }
    return stars;
  };

  const getImageUrl = () => {
    if (imageError || !product.image) {
      return fallbackImage;
    }
    return product.image;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover">
      <div className="relative p-4 bg-gradient-to-br from-teal-50 to-cyan-50 h-48 flex items-center justify-center">
        <img 
          src={getImageUrl()}
          alt={product.name}
          className="h-32 w-32 object-contain"
          onError={() => setImageError(true)}
        />
        {product.stock && product.stock < 50 && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Low Stock
          </span>
        )}
        {product.nutriscore && product.nutriscore !== 'N/A' && (
          <span className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            NutriScore {product.nutriscore.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight flex-1">
            {product.name}
          </h3>
          {product.barcode && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              #{product.barcode.slice(-6)}
            </span>
          )}
        </div>
        
        {product.brand && product.brand !== 'Generic' && (
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-medium">{product.brand}</span>
          </p>
        )}
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.description || 'Premium quality product'}
        </p>
        
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-teal-700">R{(product.pricePerUnit || 0).toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-1">/ {product.unit || 'unit'}</span>
          </div>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
            Min: {product.minOrder || 1}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          {renderStars(product.rating)}
          <span className="text-gray-500 text-sm">({product.reviews || 0})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {product.unit || 'unit'}s
            </span>
          </div>
          <button 
            onClick={handleAdd}
            className="btn-gradient text-white font-semibold py-2 px-4 rounded-xl transition-all hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <i className="fas fa-cart-plus"></i>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        
        {cartQuantity > 0 && (
          <div className="mt-3 bg-gradient-to-r from-teal-50 to-cyan-50 p-2 rounded-xl flex justify-between items-center animate-slide-in">
            <span className="text-sm font-medium text-teal-700">
              <i className="fas fa-shopping-cart mr-1"></i>
              {cartQuantity} in cart
            </span>
            <button 
              onClick={() => {
                if (window.confirm('Remove all from cart?')) {
                  onAddToCart(product.id, -cartQuantity);
                }
              }}
              className="text-red-500 hover:text-red-700 font-bold px-2"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;