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
    <form onSubmit={handleSubmit} className="relative flex-1 md:flex-none w-full">
      <div className="relative flex items-center w-full">
        <FaSearch className="absolute left-4 text-gray-400 text-base" />
        <input 
          type="text" 
          placeholder="Search product..." 
          value={localTerm}
          onChange={handleChange}
          className="w-full md:w-80 pl-11 pr-10 py-3 sm:py-2 bg-white border border-gray-300 rounded text-base sm:text-sm focus:ring-1 focus:ring-brand-700 outline-none transition-colors h-[48px] sm:h-[44px]"
        />
        {isLoading && (
          <i className="fas fa-circle-notch fa-spin absolute right-4 text-brand-600 text-base"></i>
        )}
        {localTerm && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setLocalTerm('');
              onSearchChange('');
            }}
            className="absolute right-4 text-gray-400 hover:text-gray-600 p-2 -mr-2"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;