import React from 'react';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../component/StatusCard';
import TableHeader from './../component/TableHeader';
import BookingTable from './../component/TableBooking';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';

const bookingData = [
  { name: 'Jason Lee', vNo: 'CA-1234', vName: 'Toyota Corolla', pDate: '2026-01-23', rDate: '2026-01-25', price: '24,000', status: 'Pending', sColor: 'text-status-pending' },
  { name: 'Kevin Martinez', vNo: 'WP-4678', vName: 'Honda Civic', pDate: '2026-01-20', rDate: '2026-01-26', price: '10,000', status: 'Approved', sColor: 'text-status-approved' },
  { name: 'Daniel Smith', vNo: 'CL-9101', vName: 'Suzuki Swift', pDate: '2026-01-18', rDate: '2026-01-20', price: '10,000', status: 'Pending', sColor: 'text-status-pending' },
  { name: 'Alex Johnson', vNo: 'WP-4455', vName: 'Nissan Leaf', pDate: '2026-01-04', rDate: '2026-01-05', price: '15,000', status: 'Rejected', sColor: 'text-status-rejected' },
];

const Dashboard = () => {
  const stats = [
    { label: 'Total Requests', val: '1,240', icon: <Car size={40} />, color: 'border-brand-dark' },
    { label: 'Pending Requests', val: '45', icon: <Hourglass size={40} />, color: 'border-brand-dark' },
    { label: 'Approved Requests', val: '890', icon: <CheckCircle2 size={40} />, color: 'border-brand-dark' },
    { label: 'Rejected Requests', val: '12', icon: <XCircle size={40} />, color: 'border-brand-dark' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-app-bg font-sans">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto"> 
            <h1 className="text-2xl font-bold text-brand-dark">Booking Request</h1>
            <p className="text-brand-dark mb-8 opacity-80">Manage incoming booking request</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {stats.map((s, i) => <StatsCard key={i} {...s} />)}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm">
                <TableHeader />
                <BookingTable data={bookingData} />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;