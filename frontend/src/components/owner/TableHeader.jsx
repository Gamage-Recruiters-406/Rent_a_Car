import React from 'react';
import { Search } from 'lucide-react';

const TableHeader = ({ activeFilter, onFilterChange, searchTerm, onSearchChange }) => {
  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
      <h2 className="text-xl font-bold text-brand-dark">Booking Requests List</h2>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-brand-dark text-white shadow-md'
                  : 'text-gray-500 hover:text-brand-dark hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={18} 
          />
          <input 
            type="text" 
            placeholder="Search customer or vehicle..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-dark/20 w-64 bg-white text-sm text-brand-dark placeholder:text-gray-400 transition-all"
          />
          
          {/* Optional: Clear search button appears only when there is text */}
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableHeader;