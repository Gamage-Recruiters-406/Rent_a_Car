import React, { useState, useEffect } from 'react';

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded stats (These can also be fetched from backend later if needed)
  const stats = {
    totalUsers: 130,
    owners: 50,
    customers: 80
  };

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        // 1. Get the Token (Admins usually have a token after login)
        const token = localStorage.getItem('token'); 

        // 2. BUILD THE URL DYNAMICALLY FROM .ENV
        const baseUrl = import.meta.env.VITE_API_BASE_URL; // http://localhost:8090
        const version = import.meta.env.VITE_API_VERSION;  // /api/v1
        
        // Final URL: http://localhost:8090/api/v1/admin/owners
        // (Make sure to confirm '/admin/owners' is the correct endpoint with your team!)
        const url = `${baseUrl}${version}/admin/owners`;

        console.log("Fetching from:", url); // This helps you debug in the browser console

        const response = await fetch(url, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             // 'Authorization': `Bearer ${token}` // Uncomment this if your backend requires login
           }
        });

        if (response.ok) {
          const data = await response.json();
          setOwners(data); // Load real data from MongoDB
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.log("Backend connection failed or route wrong. Using Mock Data.");
        // Fallback Mock Data
        setOwners([
          { id: 1, name: 'J. Perera', email: 'j@x.com', role: 'Owner', status: 'Active' },
          { id: 2, name: 'S. Silva', email: 's@y.com', role: 'Owner', status: 'Pending' },
          { id: 3, name: 'K. Fernando', email: 'k@f.com', role: 'Owner', status: 'Suspended' },
          { id: 4, name: 'J. Miranda', email: 'j@m.com', role: 'Owner', status: 'Active' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">User Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl mr-4">👥</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3><p className="text-gray-500 text-sm">Total Users</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl mr-4">👤</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{stats.owners}</h3><p className="text-gray-500 text-sm">Owners</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mr-4">⭐</div>
          <div><h3 className="text-3xl font-bold text-gray-800">{stats.customers}</h3><p className="text-gray-500 text-sm">Customers</p></div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-6">
        <button className="px-6 py-2 rounded-full bg-blue-900 text-white font-semibold text-sm shadow-md">Owner</button>
        <button className="px-6 py-2 rounded-full text-gray-500 font-semibold text-sm hover:bg-gray-200 transition">Customer</button>
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white shadow-sm outline-none">
          <option>Status</option>
          <option>Active</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">E-Mail</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
            ) : (
              owners.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className={`${user.status === 'Active' ? 'text-green-600' : user.status === 'Pending' ? 'text-blue-500' : 'text-red-500'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="bg-blue-900 text-white px-4 py-1 rounded-md text-xs font-semibold hover:bg-blue-800 transition">Details</button>
                  </td>
                </tr>
              ))
            )}
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