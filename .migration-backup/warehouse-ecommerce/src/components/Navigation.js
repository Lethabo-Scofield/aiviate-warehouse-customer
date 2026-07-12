import React, { useState } from 'react';
import { 
  FaHome, 
  FaShoppingCart, 
  FaHistory, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTruck,
  FaUserCircle,
  FaStore,
  FaClipboardList
} from 'react-icons/fa';

const Navigation = ({ cartCount, onNavigate, currentPage, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'orders', label: 'Order History', icon: FaHistory },
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/85 backdrop-blur-lg shadow-[0_8px_28px_rgba(2,23,24,0.08)] border-b border-slate-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 p-2 rounded-xl shadow-lg">
              <FaTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">
                <span className="gradient-text">BulkMart</span>
                <span className="text-gray-600 text-xs font-medium ml-1">PRO</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`text-sm ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Cart Button */}
            <button
              onClick={() => handleNavClick('cart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all relative ${
                  currentPage === 'cart' 
                    ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaShoppingCart className="text-sm" />
              <span className="font-medium">Cart</span>
              {cartCount > 0 && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  currentPage === 'cart' ? 'bg-white text-teal-700' : 'bg-teal-100 text-teal-700'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 flex items-center justify-center text-white font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user?.name || 'User'}
                </span>
                <FaUser className="text-gray-400 text-xs" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slide-in">
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 flex items-center justify-center text-white font-bold">
                          {user?.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleNavClick('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FaUserCircle className="text-gray-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FaClipboardList className="text-gray-400" />
                      <span>Order History</span>
                    </button>
                    {user?.company && (
                      <button
                        onClick={() => {
                          handleNavClick('settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <FaStore className="text-gray-400" />
                        <span>{user.company}</span>
                      </button>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              {/* Cart in mobile */}
              <button
                onClick={() => handleNavClick('cart')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === 'cart' 
                    ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaShoppingCart className={`text-lg ${currentPage === 'cart' ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">Cart</span>
                {cartCount > 0 && (
                  <span className={`ml-auto px-3 py-0.5 text-xs rounded-full ${
                    currentPage === 'cart' ? 'bg-white text-teal-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* User Section */}
              <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-700 to-cyan-700 flex items-center justify-center text-white font-bold">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;