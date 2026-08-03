import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider, useOrders } from './contexts/OrderContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useProducts } from './hooks/useProducts';
import ProductCard from './components/ProductCard';
import CartSummary from './components/CartSummary';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import PaymentModal from './components/PaymentModal';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import OrderHistory from './pages/OrderHistory';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

// Main App Content (Protected)
function AppContent() {
  const { user } = useAuth();
  const { products, loading, error, categories, searchProducts, refetch } = useProducts();
  const { orders, addOrder, updateOrderAddress } = useOrders();
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isSearching, setIsSearching] = useState(false);

  // Handle navigation
  const handleNavigate = (page) => {
    // The cart lives at the top of the catalog page, so "cart" goes home + top
    const target = page === 'cart' ? 'home' : page;
    setCurrentPage(target);
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchTerm(query);
    setIsSearching(true);
    
    try {
      if (query.trim() === '') {
        await refetch();
      } else {
        await searchProducts(query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Filtered products
  const filteredProducts = () => {
    if (searchTerm.trim() !== '' && products.length > 0) {
      return products;
    }
    return categoryFilter === 'All' 
      ? products 
      : products.filter(p => p.category === categoryFilter);
  };

  // Cart operations
  const addToCart = (productId, quantity) => {
    const cartKey = String(productId);
    if (quantity <= 0) {
      setCart(prev => {
        const { [cartKey]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setCart(prev => {
      const existing = prev[cartKey] || 0;
      return { ...prev, [cartKey]: existing + quantity };
    });
  };

  const removeFromCart = (productId, quantity = 1) => {
    const cartKey = String(productId);
    setCart(prev => {
      const existing = prev[cartKey] || 0;
      const newQty = Math.max(0, existing - quantity);
      if (newQty === 0) {
        const { [cartKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [cartKey]: newQty };
    });
  };

  const clearCart = () => setCart({});

  const handleCheckout = (items, total) => {
    setCurrentOrder({ items, total });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      const orderData = {
        items: currentOrder.items,
        total: currentOrder.total,
        status: 'confirmed',
        userId: user?.id,
        userEmail: user?.email,
        customerName: paymentDetails?.customerName || user?.name || '',
        customerEmail: paymentDetails?.customerEmail || user?.email || '',
        shippingAddress: paymentDetails?.shippingAddress || '',
        shippingLatitude: paymentDetails?.shippingLatitude ?? null,
        shippingLongitude: paymentDetails?.shippingLongitude ?? null,
        paymentMethod: paymentDetails?.paymentMethod || 'card',
        paymentStatus: paymentDetails?.paymentStatus || 'paid'
      };
      
      await addOrder(orderData);
      
      setCart({});
      setCurrentOrder(null);
      setIsPaymentModalOpen(false);
      
      alert('Order confirmed.');
      setCurrentPage('orders');
    } catch (error) {
      alert(`Error processing your order: ${error.message}`);
      console.error('Order error:', error);
      throw error;
    }
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Render different pages
  const renderContent = () => {
    if (currentPage === 'orders') {
      return <OrderHistory orders={orders} onUpdateOrderAddress={updateOrderAddress} />;
    }

    // Home page
    if (loading && !isSearching) {
      return <div className="py-12"><LoadingSpinner /></div>;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="flex-1 min-w-0">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 flex items-center gap-3 text-red-700">
              <FaExclamationTriangle className="text-red-500" />
              <span className="text-sm font-medium flex-1">{error}</span>
              <button 
                onClick={refetch}
                className="text-sm font-bold text-red-700 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 flex items-center gap-2 text-blue-800 text-sm">
            <FaInfoCircle />
            <span>Products powered by Open Food Facts API</span>
          </div>

          {/* Toolbar */}
          <div className="bg-white border border-gray-200 p-3 rounded mb-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 shadow-sm">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={handleSearch} 
              isLoading={isSearching}
            />
            <div className="flex gap-2 items-stretch flex-1 sm:flex-none">
              <div className="flex-1 sm:flex-none min-w-0">
                <CategoryFilter 
                  categories={categories} 
                  selectedCategory={categoryFilter} 
                  onCategoryChange={(category) => {
                    setCategoryFilter(category);
                    if (category === 'All') {
                      refetch();
                    }
                  }} 
                />
              </div>
              <button 
                onClick={refetch}
                className="btn-outline sm:hidden shrink-0 w-[48px] h-[48px] !p-0 flex items-center justify-center"
                disabled={loading}
                aria-label="Refresh catalog"
                title="Refresh catalog"
              >
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
            <button 
              onClick={refetch}
              className="btn-outline sm:ml-auto !hidden sm:!inline-flex"
              disabled={loading}
            >
              <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              Refresh Catalog
            </button>
          </div>

          {filteredProducts().length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded">
              <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-1 text-sm">
                {searchTerm ? `No matches for "${searchTerm}"` : 'Try adjusting your category filter'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => handleSearch('')}
                  className="mt-4 text-brand-700 hover:underline text-sm font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3 px-1">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Product Catalog <span className="text-gray-400 font-normal ml-2">({filteredProducts().length} items)</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts().map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAddToCart={addToCart}
                    cartQuantity={cart[String(p.id)] || 0}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Cart — shown first (top) on mobile, right column on desktop */}
        <div className="order-first lg:order-last lg:w-80 xl:w-96 flex-shrink-0">
          <CartSummary 
            cart={cart}
            products={products}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navigation 
        cartCount={cartCount} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      <main className="flex-1 container-custom my-6">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container-custom py-6 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">BulkMart Pro Wholesale Distributor</p>
          <p className="mt-1 text-xs">Data sourced from Open Food Facts API</p>
        </div>
      </footer>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCurrentOrder(null);
        }}
        orderSummary={currentOrder?.items || []}
        total={currentOrder?.total || 0}
        onPaymentSuccess={handlePaymentSuccess}
        initialCustomerName={user?.name || ''}
        initialCustomerEmail={user?.email || ''}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;