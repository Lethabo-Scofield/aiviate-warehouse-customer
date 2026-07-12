import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <i className="fas fa-circle-notch fa-spin text-4xl text-brand-700 mb-4"></i>
      <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Loading Catalog</p>
    </div>
  );
};

export default LoadingSpinner;