import React, { useState } from 'react';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../../component/Cards';
import TableHeader from './../../component/TableHeader';
import BookingTable from './../../component/BookingTable';

const bookingData = [
  { name: 'Jason Lee', vOwner: 'Sam Perera', vName: 'Toyota Corolla', pDate: '2026-01-23', rDate: '2026-01-25', price: '24,000', status: 'Pending', sColor: 'text-orange-500' },
  { name: 'Kevin Martinez', vOwner: 'Sam Perera', vName: 'Honda Civic', pDate: '2026-01-20', rDate: '2026-01-26', price: '10,000', status: 'Approved', sColor: 'text-green-500' },
  { name: 'Daniel Smith', vOwner: 'Kevin Jones', vName: 'Suzuki Swift', pDate: '2026-01-18', rDate: '2026-01-20', price: '10,000', status: 'Pending', sColor: 'text-orange-500' },
  { name: 'Alex Johnson', vOwner: 'Alex Tan', vName: 'Nissan Leaf', pDate: '2026-01-04', rDate: '2026-01-05', price: '15,000', status: 'Rejected', sColor: 'text-red-500' },
  { name: 'Ryan Peterson', vOwner: 'Kevin Jones', vName: 'Honda Civic', pDate: '2026-01-05', rDate: '2026-01-12', price: '20,000', status: 'Rejected', sColor: 'text-red-500' },
];

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Bookings', val: '1360', icon: <Car size={40} />, color: 'purple' },
    { label: 'Pending Bookings', val: '220', icon: <Hourglass size={40} />, color: 'yellow' },
    { label: 'Approved Bookings', val: '1000', icon: <CheckCircle2 size={40} />, color: 'green' },
    { label: 'Rejected Bookings', val: '160', icon: <XCircle size={40} />, color: 'red' },
  ];

  // Filter by status
  const filteredData = activeFilter === 'All' 
    ? bookingData 
    : bookingData.filter(booking => booking.status === activeFilter);

  // Filter by search query
  const searchFilteredData = searchQuery.trim() === ''
    ? filteredData
    : filteredData.filter(booking => 
        booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.vOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.vName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.pDate.includes(searchQuery) ||
        booking.rDate.includes(searchQuery) ||
        booking.price.includes(searchQuery) ||
        booking.status.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex h-screen bg-app-bg font-sans">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10">
          <h1 className="text-2xl font-bold text-brand-dark">Recent Bookings (View Only)</h1>
          <p className="text-brand-dark mb-8 opacity-80">View all the recent bookings made by customers here</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {stats.map((s, i) => <StatsCard key={i} {...s} />)}
          </div>

          <TableHeader 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <BookingTable data={searchFilteredData} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
