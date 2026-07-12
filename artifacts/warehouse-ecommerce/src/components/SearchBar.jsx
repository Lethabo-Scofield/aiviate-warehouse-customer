import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ searchTerm, onSearchChange, isLoading = false }) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalTerm(value);
    onSearchChange(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 md:flex-none">
      <div className="relative flex items-center">
        <FaSearch className="absolute left-3 text-gray-400 text-sm" />
        <input 
          type="text" 
          placeholder="Search by product name or ID..." 
          value={localTerm}
          onChange={handleChange}
          className="w-full md:w-80 pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-700 outline-none transition-colors"
        />
        {isLoading && (
          <i className="fas fa-circle-notch fa-spin absolute right-3 text-brand-600 text-sm"></i>
        )}
        {localTerm && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setLocalTerm('');
              onSearchChange('');
            }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 text-sm font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;