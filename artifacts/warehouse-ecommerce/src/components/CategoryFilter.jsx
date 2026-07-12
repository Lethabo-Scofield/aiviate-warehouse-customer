import React from 'react';
import { FaFilter } from 'react-icons/fa';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="relative flex items-center">
      <FaFilter className="absolute left-3 text-gray-400 text-xs pointer-events-none" />
      <select 
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="pl-8 pr-8 py-2 bg-white border border-gray-300 rounded text-sm font-medium focus:ring-1 focus:ring-brand-700 outline-none transition-colors appearance-none min-w-[140px]"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <i className="fas fa-chevron-down absolute right-3 text-gray-400 text-xs pointer-events-none"></i>
    </div>
  );
};

export default CategoryFilter;