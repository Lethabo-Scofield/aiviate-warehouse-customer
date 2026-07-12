import React, { useState } from 'react';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes, FaBoxOpen, FaClipboardList } from 'react-icons/fa';

const Navigation = ({ cartCount, onNavigate, currentPage, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Catalog', icon: FaBoxOpen },
    { id: 'orders', label: 'Orders', icon: FaClipboardList },
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-[#052e16] text-white sticky top-0 z-50 shadow-md">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="bg-white text-[#052e16] p-1.5 rounded flex items-center justify-center">
              <i className="fas fa-pallet text-xl"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                BulkMart<span className="text-brand-400 font-bold ml-1">PRO</span>
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
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-bold uppercase tracking-wider ${
                    isActive 
                      ? 'bg-brand-700 text-white' 
                      : 'text-gray-300 hover:bg-brand-800 hover:text-white'
                  }`}
                >
                  <Icon className="text-base" />
                  {item.label}
                </button>
              );
            })}
            
            <div className="w-px h-6 bg-brand-800 mx-2"></div>
            
            {/* Cart Button */}
            <button
              onClick={() => handleNavClick('cart')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-bold uppercase tracking-wider ${
                  currentPage === 'cart' 
                    ? 'bg-brand-700 text-white' 
                    : 'text-gray-300 hover:bg-brand-800 hover:text-white'
              }`}
            >
              <FaShoppingCart className="text-base" />
              CART
              {cartCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded bg-accent-500 text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="w-px h-6 bg-brand-800 mx-2"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-brand-800 transition-colors"
              >
                <div className="w-8 h-8 rounded bg-gray-200 text-brand-900 flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold leading-tight">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 font-medium">{user?.company || 'Store Account'}</p>
                </div>
                <i className="fas fa-chevron-down text-xs text-gray-400 ml-1"></i>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded border border-gray-200 shadow-xl overflow-hidden text-gray-800">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-bold text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-brand-800 transition-colors text-white"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-brand-800 pb-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded font-bold uppercase tracking-wider text-sm ${
                      isActive ? 'bg-brand-700 text-white' : 'text-gray-300 hover:bg-brand-800'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    {item.label}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleNavClick('cart')}
                className={`flex items-center gap-3 px-4 py-3 rounded font-bold uppercase tracking-wider text-sm ${
                  currentPage === 'cart' ? 'bg-brand-700 text-white' : 'text-gray-300 hover:bg-brand-800'
                }`}
              >
                <FaShoppingCart className="text-lg" />
                CART
                {cartCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded bg-accent-500 text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div className="border-t border-brand-800 mt-2 pt-2">
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-200 text-brand-900 flex items-center justify-center font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mt-1 flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-brand-800"
                >
                  <FaSignOutAlt /> Sign Out
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