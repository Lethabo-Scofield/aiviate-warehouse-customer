import React, { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const SearchBar = ({ searchTerm, onSearchChange, isLoading = false }) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalTerm(value);
    // Auto-search after typing (with debounce would be better)
    onSearchChange(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 md:flex-none">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search supermarket products..." 
          value={localTerm}
          onChange={handleChange}
          className="w-full md:w-72 pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none transition-all shadow-sm"
        />
        {isLoading && (
          <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 animate-spin" />
        )}
        {localTerm && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setLocalTerm('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;