import React, { useState, useEffect } from 'react';

const CustomerManagement = () => {
  // Mock Data for Customers
  const [customers, setCustomers] = useState([
    { id: 1, name: 'C. Bandara', email: 'c.bandara@gmail.com', role: 'Customer', status: 'Active' },
    { id: 2, name: 'M. Perera', email: 'm.perera@yahoo.com', role: 'Customer', status: 'Pending' },
    { id: 3, name: 'S. Fernando', email: 's.fernando@hotmail.com', role: 'Customer', status: 'Active' },
    { id: 4, name: 'D. Liyanage', email: 'd.liyanage@gmail.com', role: 'Customer', status: 'Suspended' },
  ]);
  const [loading, setLoading] = useState(true);

  // Stats
  const stats = { totalUsers: 130, owners: 50, customers: 80 };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        
        // Fetching from /admin/customers endpoint
        const response = await fetch(`${baseUrl}${version}/admin/customers`, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}` 
           }
        });

        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          console.log("Backend not connected. Using Mock Data.");
        }
      } catch (error) {
        console.log("Using mock data (Backend likely offline)");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">User Management</h1>

      {/* Stats Cards (Same as Owner Page) */}
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

      {/* Tab Switcher - Notice "Customer" is now Blue (Active) */}
      <div className="flex space-x-4 mb-6">
        <button className="px-6 py-2 rounded-full text-gray-500 font-semibold text-sm hover:bg-gray-200 transition">
          Owner
        </button>
        <button className="px-6 py-2 rounded-full bg-blue-900 text-white font-semibold text-sm shadow-md">
          Customer
        </button>
      </div>

      {/* Customer Table */}
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
            {customers.map((user) => (
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
      </div>
    </div>
  );
};

export default CustomerManagement;