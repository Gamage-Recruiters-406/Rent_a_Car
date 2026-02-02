import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import StatsCard from './../../components/owner/StatusCard';
import TableHeader from './../../components/owner/TableHeader';
import BookingTable from './../../components/owner/TableBooking';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';

// .env variables
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Requests', val: '0', icon: <Car size={40} />, color: 'border-brand-dark' },
    { label: 'Pending Requests', val: '0', icon: <Hourglass size={40} />, color: 'border-brand-dark' },
    { label: 'Approved Requests', val: '0', icon: <CheckCircle2 size={40} />, color: 'border-brand-dark' },
    { label: 'Rejected Requests', val: '0', icon: <XCircle size={40} />, color: 'border-brand-dark' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem("userid");

      if (!token || !currentUserId) {
        console.error("Token or UserID missing!");
        setLoading(false);
        return;
      }

      // Backend middleware 
      document.cookie = `access_token=${token}; path=/; SameSite=Lax;`;

      // API URL 
      const url = `${baseUrl}${apiVersion}/bookings/owner/${currentUserId}`;

      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("FULL API RESPONSE:", response.data);

      if (response.data.success) {
        const fetchedData = response.data.data || [];
        setBookings(fetchedData);
        
        // Stats update logic
        setStats([
          { label: 'Total Requests', val: fetchedData.length.toString(), icon: <Car size={40} />, color: 'border-brand-dark' },
          { label: 'Pending Requests', val: fetchedData.filter(b => b.status === 'pending').length.toString(), icon: <Hourglass size={40} />, color: 'border-brand-dark' },
          { label: 'Approved Requests', val: fetchedData.filter(b => b.status === 'approved').length.toString(), icon: <CheckCircle2 size={40} />, color: 'border-brand-dark' },
          { label: 'Rejected Requests', val: fetchedData.filter(b => b.status === 'rejected').length.toString(), icon: <XCircle size={40} />, color: 'border-brand-dark' },
        ]);
      }

    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
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

            <div className="bg-white rounded-lg shadow-sm">
              <TableHeader />
              {loading ? (
                <div className="p-10 text-center">Loading bookings...</div>
              ) : (
                <BookingTable data={bookings} refreshData={fetchDashboardData} />
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