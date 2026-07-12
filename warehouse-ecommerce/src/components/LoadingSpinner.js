import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-700 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center mt-24">
          <p className="text-gray-500 font-medium animate-pulse">Loading products...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;