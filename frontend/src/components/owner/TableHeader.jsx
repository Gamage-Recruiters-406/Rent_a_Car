import React from 'react';
import { Search } from 'lucide-react';

const TableHeader = ({ activeFilter, onFilterChange }) => {
  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 p-4">
      <h2 className="text-xl font-semibold text-brand-dark">Booking Requests List</h2>
      <div className="flex items-center gap-4">
        
        {/* Filter Tabs */}
        <div className="flex bg-gray-200 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeFilter === tab
                  ? 'bg-brand-dark text-white shadow-sm' 
                  : 'text-gray-600 hover:text-brand-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 border border-brand-dark rounded-lg focus:outline-none w-64 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default TableHeader;