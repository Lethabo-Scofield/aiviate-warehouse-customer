import React from 'react';
import { FaFilter } from 'react-icons/fa';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="relative flex items-center w-full sm:w-auto">
      <FaFilter className="absolute left-4 text-gray-400 text-sm pointer-events-none" />
      <select 
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full sm:w-auto pl-10 pr-10 py-3 sm:py-2 bg-white border border-gray-300 rounded text-base sm:text-sm font-medium focus:ring-1 focus:ring-brand-700 outline-none transition-colors appearance-none min-w-[140px] h-[48px] sm:h-[44px]"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <i className="fas fa-chevron-down absolute right-4 text-gray-400 text-sm pointer-events-none"></i>
    </div>
  );
};

export default CategoryFilter;