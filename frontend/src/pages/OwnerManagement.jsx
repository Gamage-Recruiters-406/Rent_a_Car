import React, { useState, useEffect } from 'react';

const OwnerManagement = () => {
  // Default to mock data so the page is never empty
  const [owners, setOwners] = useState([
    { id: 1, name: 'J. Perera', email: 'j@x.com', role: 'Owner', status: 'Active' },
    { id: 2, name: 'S. Silva', email: 's@y.com', role: 'Owner', status: 'Pending' },
    { id: 3, name: 'K. Fernando', email: 'k@f.com', role: 'Owner', status: 'Suspended' },
    { id: 4, name: 'J. Miranda', email: 'j@m.com', role: 'Owner', status: 'Active' },
  ]);
  const [loading, setLoading] = useState(true);

  // Hardcoded stats
  const stats = {
    totalUsers: 130,
    owners: 50,
    customers: 80
  };

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Try to fetch from backend
        // Note: Make sure VITE_API_BASE_URL is set in your .env file
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        
        const response = await fetch(`${baseUrl}${version}/admin/owners`, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}` 
           }
        });

        if (response.ok) {
          const data = await response.json();
          setOwners(data); // If backend works, use real data
        } else {
          console.log("Backend not connected or error. Using Mock Data.");
        }
      } catch (error) {
        console.log("Using mock data (Backend likely offline)");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-blue-900 mb-8">User Management</h1>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl mr-4">
            👥
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
            <p className="text-gray-500 text-sm">Total Users</p>
          </div>
        </div>

        {/* Card 2: Owners */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl mr-4">
            👤
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.owners}</h3>
            <p className="text-gray-500 text-sm">Owners</p>
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mr-4">
            ⭐
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.customers}</h3>
            <p className="text-gray-500 text-sm">Customers</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-6">
        <button className="px-6 py-2 rounded-full bg-blue-900 text-white font-semibold text-sm shadow-md">
          Owner
        </button>
        <button className="px-6 py-2 rounded-full text-gray-500 font-semibold text-sm hover:bg-gray-200 transition">
          Customer
        </button>
      </div>

      {/* Filter Dropdown */}
      <div className="flex justify-end mb-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Status</option>
          <option>Active</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">E-Mail</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {owners.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className={`
                      ${user.status === 'Active' ? 'text-green-600' : ''}
                      ${user.status === 'Pending' ? 'text-blue-500' : ''}
                      ${user.status === 'Suspended' ? 'text-red-500' : ''}
                    `}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-blue-900 text-white px-4 py-1 rounded-md text-xs font-semibold hover:bg-blue-800 transition">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end items-center p-6 space-x-4 border-t border-gray-200">
            <button className="text-blue-900 font-bold hover:underline text-sm">&lt; Prev</button>
            <span className="text-sm text-gray-600">Page 1 of 5</span>
            <button className="text-blue-900 font-bold hover:underline text-sm">Next &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerManagement;