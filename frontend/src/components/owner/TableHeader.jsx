import React from 'react';
import { Search } from 'lucide-react';

const TableHeader = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
    <h2 className="text-xl font-semibold text-brand-dark">Booking Requests List</h2>
    <div className="flex items-center gap-4">
      {/* Filter Tabs */}
      <div className="flex bg-gray-200 rounded-lg p-1">
        <button className="px-6 py-2 bg-brand-dark text-white rounded-md text-sm font-medium">All</button>
        <button className="px-6 py-2 text-gray-600 hover:text-brand-dark text-sm font-medium">Pending</button>
        <button className="px-6 py-2 text-gray-600 hover:text-brand-dark text-sm font-medium">Approved</button>
        <button className="px-6 py-2 text-gray-600 hover:text-brand-dark text-sm font-medium">Rejected</button>
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

export default TableHeader;