import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Single-user store: the app signs in automatically, so there is no login
// screen. We only show a loading state (or a retry prompt if the automatic
// sign-in fails) before opening the store.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error, autoLogin } = useAuth();

  if (isAuthenticated) {
    return children;
  }

  if (isLoading || !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Opening store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded p-8 text-center max-w-sm w-full shadow-sm">
        <i className="fas fa-plug text-3xl text-gray-300 mb-4"></i>
        <h2 className="text-lg font-bold text-gray-900">Could not open the store</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <button onClick={autoLogin} className="btn-primary mt-6 w-full py-3">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;
