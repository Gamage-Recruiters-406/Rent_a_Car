import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]); // ✅ State for filtered data
  const [stats, setStats] = useState({ totalUsers: 0, owners: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Status'); // ✅ State for dropdown value

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const version = import.meta.env.VITE_API_VERSION;
        const token = localStorage.getItem('token');

        // 1. Fetch Owners List
        const ownersResponse = await fetch(`${baseUrl}${version}/admin/owners`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // 2. Fetch User Statistics
        const statsResponse = await fetch(`${baseUrl}${version}/admin/user-stats`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const ownersData = await ownersResponse.json();
        const statsData = await statsResponse.json();

        if (ownersResponse.ok) {
          const dataArray = Array.isArray(ownersData) ? ownersData : ownersData.users || [];
          setOwners(dataArray);
          setFilteredOwners(dataArray); // Initial load displays everyone
        }

        if (statsResponse.ok) {
          setStats({
            totalUsers: statsData.totalUsers || 0,
            owners: statsData.owners || 0,
            customers: statsData.customers || 0
          });
        }

        setError(null);
      } catch (err) {
        setError("Could not connect to the server. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Trigger filtering whenever the statusFilter or original owners list changes
  useEffect(() => {
    if (statusFilter === 'Status') {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter((user) => 
        user.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredOwners(filtered);
    }
  }, [statusFilter, owners]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-2xl font-bold text-blue-900 mb-8">User Management</h1>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl mr-4 text-purple-600">👥</div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.totalUsers}</h3>
            <p className="text-gray-500 text-sm">Total Users</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 ring-2 ring-orange-50 flex items-center">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl mr-4 text-orange-500">👤</div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.owners}</h3>
            <p className="text-gray-500 text-sm">Owners</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mr-4 text-green-500">⭐</div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.customers}</h3>
            <p className="text-gray-500 text-sm">Customers</p>
          </div>
        </div>
      </div>

      {/* --- Tab Switcher & Filter --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex space-x-4 bg-gray-200 p-1 rounded-full">
          <button className="px-8 py-2 rounded-full bg-blue-900 text-white font-semibold text-sm shadow-md transition-all">
            Owner
          </button>
          <Link to="/admin/customers" className="px-8 py-2 rounded-full text-gray-600 font-semibold text-sm hover:bg-gray-300 transition-all">
            Customer
          </Link>
        </div>

        <div className="mt-4 md:mt-0">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Status">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="suspend">Suspended</option>
          </select>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">E-Mail</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-12 italic">Connecting to Database...</td></tr>
            ) : error ? (
              <tr><td colSpan="4" className="text-center py-12 text-red-500 font-medium">{error}</td></tr>
            ) : filteredOwners.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400 italic">No owners matching this status.</td></tr>
            ) : (
              filteredOwners.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {/* Combine name fields from your database schema */}
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'verified' ? 'text-green-600 bg-green-50' : 
                      user.status === 'pending' ? 'text-blue-500 bg-blue-50' : 
                      'text-red-500 bg-red-50'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-900 text-white px-5 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 transition shadow-sm">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* --- Pagination Footer --- */}
        <div className="flex justify-end items-center p-4 bg-white border-t border-gray-200">
          <button className="text-gray-500 hover:text-blue-900 font-medium text-sm px-2 flex items-center">
            <span className="mr-1">‹</span> Prev
          </button>
          <span className="text-sm text-gray-600 mx-4 font-medium">Page 1 of 5</span>
          <button className="text-blue-900 font-bold hover:text-blue-700 text-sm px-2 flex items-center">
            Next <span className="ml-1">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerManagement;