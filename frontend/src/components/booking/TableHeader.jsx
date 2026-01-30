import React from 'react';
import { Search } from 'lucide-react';

const TableHeader = ({ activeFilter, onFilterChange, searchQuery, onSearchChange }) => {
  const filters = ['All', 'Pending', 'Approved', 'Rejected'];
  
  return (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
    <h2 className="text-xl font-semibold text-brand-dark">All Bookings</h2>

    <div className="flex items-center gap-4">
      {/* Filter Tabs */}
      <div className="flex w-fit bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-[#0D3778] text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
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
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0D3778] w-64 bg-white"
        />
      </div>
    </div>
  </div>
  );
};

export default TableHeader;
