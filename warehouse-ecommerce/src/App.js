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
import { 
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

// Main App Content (Protected)
function AppContent() {
  const { user, logout } = useAuth();
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
    setCurrentPage(page);
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      alert('🎉 Order confirmed! Check your order history.');
      setCurrentPage('orders');
    } catch (error) {
      alert(`❌ ${error.message || 'There was an error processing your order. Please try again.'}`);
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
      return <LoadingSpinner />;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-2 text-red-600">
              <FaExclamationTriangle />
              <span className="text-sm font-medium flex-1">{error}</span>
              <button 
                onClick={refetch}
                className="text-sm text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3 mb-6 flex items-center gap-2 text-cyan-800 text-sm">
            <FaInfoCircle />
            <span>Products powered by Open Food Facts · Real product data with images</span>
          </div>

          {filteredProducts().length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
              <p className="text-gray-400 mt-2">
                {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your filters'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => handleSearch('')}
                  className="mt-4 text-teal-700 hover:text-teal-900 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredProducts().length} products
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
                <span className="text-xs text-gray-400">
                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                  Live data
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="lg:col-span-1">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <Navigation 
        cartCount={cartCount} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        user={user}
        onLogout={logout}
      />

      <main className="pt-6">
        {currentPage === 'home' && (
          <div className="container-custom">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={handleSearch} 
                isLoading={isSearching}
              />
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
              <button 
                onClick={refetch}
                className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="container-custom">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/85 backdrop-blur border-t border-slate-200 mt-12">
        <div className="container-custom py-6">
          <div className="text-center text-xs text-gray-400">
            <p>© 2026 BulkMart Pro. Powered by Open Food Facts API.</p>
            <p className="mt-1">Data sourced from Open Food Facts - The free open database of food products</p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
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

// Main App with Providers
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