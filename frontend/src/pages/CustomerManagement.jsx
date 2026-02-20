import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// ✅ IMPORT LAYOUT
import Layout from '../layouts/Layout'; 

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, owners: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        const token = localStorage.getItem('token');

        // Fetch Customers
        const custRes = await fetch(`${baseUrl}${version}/adminReports/customers`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch Stats
        const statsRes = await fetch(`${baseUrl}${version}/adminReports/user-stats`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (custRes.ok) {
          const data = await custRes.json();
          const list = Array.isArray(data) ? data : data.users || [];
          setCustomers(list);
          setFilteredCustomers(list);
        }

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats({ totalUsers: s.totalUsers || 0, owners: s.owners || 0, customers: s.customers || 0 });
        }
      } catch (err) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (statusFilter === 'Status') setFilteredCustomers(customers);
    else setFilteredCustomers(customers.filter(u => u.status?.toLowerCase() === statusFilter.toLowerCase()));
  }, [statusFilter, customers]);

  return (
    // ✅ WRAP EVERYTHING IN LAYOUT
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
        
        <h2 className="text-2xl font-bold text-blue-900 mb-6">User Management</h2>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl mr-4 text-purple-600">👥</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
              <p className="text-gray-500 text-sm">Total Users</p>
            </div>
          </div>

          {/* Owners */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl mr-4 text-orange-500">👤</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.owners}</h3>
              <p className="text-gray-500 text-sm">Owners</p>
            </div>
          </div>

          {/* Customers (Highlighted Green) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-300 ring-2 ring-green-50 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl mr-4 text-green-500">⭐</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.customers}</h3>
              <p className="text-gray-500 text-sm">Customers</p>
            </div>
          </div>
        </div>

        {/* --- Tabs & Dropdown --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Tabs */}
          <div className="flex space-x-2">
            <Link to="/admin/owners">
              <button className="px-6 py-2 rounded-full text-gray-600 font-medium text-sm hover:bg-gray-200">
                Owner
              </button>
            </Link>
            <button className="px-6 py-2 rounded-full bg-blue-900 text-white font-medium text-sm shadow-md">
              Customer
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="mt-4 md:mt-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Status">All Status</option>
              <option value="verified">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* --- Data Table --- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">E-Mail</th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-center">Customer</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold ${
                        user.status === 'verified' ? 'text-green-500' : 
                        user.status === 'pending' ? 'text-blue-500' : 
                        'text-red-500'
                      }`}>
                        {user.status === 'verified' ? 'Active' : user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-blue-900 text-white px-4 py-1 rounded text-xs hover:bg-blue-800">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 text-sm text-blue-900 font-medium cursor-pointer">
           &lt; Prev &nbsp; Page 1 of 5 &nbsp; Next &gt;
        </div>

      </div>
    </Layout>
  );
};

export default CustomerManagement;