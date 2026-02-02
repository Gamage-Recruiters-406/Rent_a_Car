import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../../components/owner/StatusCard';
import TableHeader from './../../components/owner/TableHeader';
import BookingTable from './../../components/owner/TableBooking';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState([
    { label: 'Total Requests', val: '0', icon: <Car size={40} />, color: 'border-brand-dark' },
    { label: 'Pending Requests', val: '0', icon: <Hourglass size={40} />, color: 'border-brand-dark' },
    { label: 'Approved Requests', val: '0', icon: <CheckCircle2 size={40} />, color: 'border-brand-dark' },
    { label: 'Rejected Requests', val: '0', icon: <XCircle size={40} />, color: 'border-brand-dark' },
  ]);

  // Logic to filter bookings based on BOTH Tab and Search
  const filteredBookings = bookings.filter(booking => {
    // 1. Tab Filter logic
    const matchesTab = filterStatus === 'All' || 
      booking.status?.toLowerCase() === filterStatus.toLowerCase();
    
    // 2. Search Filter logic - Search by customer name, vehicle name, or vehicle number
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' || 
      (booking.customerId?.first_name?.toLowerCase().includes(searchString)) ||
      (booking.customerId?.last_name?.toLowerCase().includes(searchString)) ||
      (booking.vehicleId?.title?.toLowerCase().includes(searchString)) || 
      (booking.vehicleId?.numberPlate?.toLowerCase().includes(searchString));

    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem("userid");

      if (!token || !currentUserId) {
        setLoading(false);
        return;
      }

      const url = `${baseUrl}${apiVersion}/bookings/owner/${currentUserId}`;
      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setBookings(fetchedData);
        
        // Update stats based on full data
        setStats([
          { label: 'Total Requests', val: fetchedData.length.toString(), icon: <Car size={40} />, color: 'border-brand-dark' },
          { label: 'Pending Requests', val: fetchedData.filter(b => b.status === 'pending').length.toString(), icon: <Hourglass size={40} />, color: 'border-brand-dark' },
          { label: 'Approved Requests', val: fetchedData.filter(b => b.status === 'approved').length.toString(), icon: <CheckCircle2 size={40} />, color: 'border-brand-dark' },
          { label: 'Rejected Requests', val: fetchedData.filter(b => b.status === 'rejected').length.toString(), icon: <XCircle size={40} />, color: 'border-brand-dark' },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-app-bg font-sans">
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto"> 
            <h1 className="text-2xl font-bold text-brand-dark">Booking Request</h1>
            <p className="text-brand-dark mb-8 opacity-80">Manage incoming booking requests from customers</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {stats.map((s, i) => <StatsCard key={i} {...s} />)}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              {/* Passing all 4 required props to TableHeader */}
              <TableHeader 
                activeFilter={filterStatus} 
                onFilterChange={setFilterStatus}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              {loading ? (
                <div className="p-10 text-center text-gray-500">Loading bookings...</div>
              ) : (
                <BookingTable data={filteredBookings} refreshData={fetchDashboardData} />
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;