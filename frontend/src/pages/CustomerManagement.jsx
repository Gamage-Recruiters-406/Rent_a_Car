import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]); // ✅ Added for filtering
  const [statusFilter, setStatusFilter] = useState('Status'); // ✅ Added for dropdown state
  const [stats, setStats] = useState({ totalUsers: 0, owners: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        const token = localStorage.getItem('token');

        // 1. Fetch Customers List
        const customersResponse = await fetch(`${baseUrl}${version}/admin/customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // 2. Fetch Dashboard Statistics
        const statsResponse = await fetch(`${baseUrl}${version}/admin/user-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const customersData = await customersResponse.json();
        const statsData = await statsResponse.json();

        if (customersResponse.ok) {
          const dataArray = Array.isArray(customersData) ? customersData : customersData.users || [];
          setCustomers(dataArray);
          setFilteredCustomers(dataArray); // Initial load
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
        setError("Could not connect to the server. Using local fallback.");
        // Fallback Mock Data for UI demonstration
        const mockData = [
          { _id: '1', first_name: 'C.', last_name: 'Bandara', email: 'c.bandara@gmail.com', role: 'Customer', status: 'verified' },
          { _id: '2', first_name: 'M.', last_name: 'Perera', email: 'm.perera@yahoo.com', role: 'Customer', status: 'pending' },
        ];
        setCustomers(mockData);
        setFilteredCustomers(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Trigger filtering whenever the statusFilter or customers list changes
  useEffect(() => {
    if (statusFilter === 'Status') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((user) => 
        user.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredCustomers(filtered);
    }
  }, [statusFilter, customers]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-2xl font-bold text-blue-900 mb-8">User Management</h1>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl mr-4 text-purple-600">👥</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.totalUsers}</h3><p className="text-gray-500 text-sm">Total Users</p></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl mr-4 text-orange-500">👤</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.owners}</h3><p className="text-gray-500 text-sm">Owners</p></div>
        </div>

        {/* Customer Card Highlighted */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 ring-2 ring-green-50 flex items-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mr-4 text-green-500">⭐</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{loading ? "..." : stats.customers}</h3><p className="text-gray-500 text-sm">Customers</p></div>
        </div>
      </div>

      {/* --- Tab Switcher & Filter --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex space-x-4 bg-gray-200 p-1 rounded-full">
          <Link to="/admin/owners" className="px-8 py-2 rounded-full text-gray-600 font-semibold text-sm hover:bg-gray-300 transition-all">
            Owner
          </Link>
          <button className="px-8 py-2 rounded-full bg-blue-900 text-white font-semibold text-sm shadow-md transition-all">
            Customer
          </button>
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

      {/* --- Customer Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">E-Mail</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-12 italic">Connecting to Database...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400 italic">No matching customers found.</td></tr>
            ) : (
              filteredCustomers.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-medium">
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

export default CustomerManagement;