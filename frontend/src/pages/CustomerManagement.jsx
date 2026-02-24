import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Layout from '../layouts/Layout'; 

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, owners: 0, customers: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Status');
  
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        const token = localStorage.getItem('token');

        const custRes = await fetch(`${baseUrl}${version}/adminReports/customers`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
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


  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      width: '300px', // Slightly tighter width
      padding: '1.5rem', // Reduces the huge default padding
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        icon: 'scale-75 my-2 border-0', // 🔹 Shrinks the giant icon by 25%
        title: 'text-lg font-bold text-gray-800 p-0', // 🔹 Smaller title
        htmlContainer: 'text-sm text-gray-500 mt-2',  // 🔹 Smaller description text
        actions: 'mt-4 space-x-2', // Brings buttons closer
        confirmButton: 'text-sm px-4 py-2 rounded-lg font-medium', // Smaller buttons
        cancelButton: 'text-sm px-4 py-2 rounded-lg font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';
        const version = import.meta.env.VITE_API_VERSION || '/api/v1';
        const token = localStorage.getItem('token');

        const response = await fetch(`${baseUrl}${version}/authUser/adminRemoveAccount/${userId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          
          const updatedList = customers.filter(user => (user._id || user.id) !== userId);
          setCustomers(updatedList);
          setFilteredCustomers(filteredCustomers.filter(user => (user._id || user.id) !== userId));
          
          setSelectedUser(null);
          
          
          Swal.fire({
            title: 'Deleted!',
            text: 'The account has been removed.',
            icon: 'success',
            width: '300px',
            padding: '1.5rem',
            customClass: { 
              popup: 'rounded-2xl shadow-xl',
              icon: 'scale-75 my-2',
              title: 'text-lg font-bold text-gray-800',
              htmlContainer: 'text-sm text-gray-500 mt-2',
              confirmButton: 'text-sm px-5 py-2 rounded-lg bg-blue-900 font-medium'
            }
          });
        } else {
          Swal.fire('Failed!', data.message || "Failed to delete account.", 'error');
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire('Error!', 'A network error occurred.', 'error');
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans relative">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">User Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl mr-4 text-purple-600">👥</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
              <p className="text-gray-500 text-sm">Total Users</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl mr-4 text-orange-500">👤</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.owners}</h3>
              <p className="text-gray-500 text-sm">Owners</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-300 ring-2 ring-green-50 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl mr-4 text-green-500">⭐</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.customers}</h3>
              <p className="text-gray-500 text-sm">Customers</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
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
          <div className="mt-4 md:mt-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Status">All Status</option>
              <option value="verified">Active</option>
              <option value="pending">Pending</option>
              <option value="suspend">Suspended</option>
            </select>
          </div>
        </div>

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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.first_name || 'N/A'} {user.last_name || ''}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-center">Customer</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold ${
                        user.status === 'verified' ? 'text-green-500' : 
                        user.status === 'pending' ? 'text-blue-500' : 'text-red-500'
                      }`}>
                        {user.status === 'verified' ? 'Active' : (user.status || 'Unknown')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedUser(user);
                        }}
                        className="bg-blue-900 text-white px-4 py-1 rounded text-xs hover:bg-blue-800 transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replaced inline zIndex with z-[60] so SweetAlert naturally overlays it */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            
            <div className="bg-blue-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Customer Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-white hover:text-gray-300 font-bold text-xl leading-none">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 uppercase">
                    {selectedUser.first_name ? selectedUser.first_name.charAt(0) : '?'}
                    {selectedUser.last_name ? selectedUser.last_name.charAt(0) : ''}
                 </div>
                 <div>
                   <h4 className="text-xl font-bold text-gray-900">{selectedUser.first_name || 'N/A'} {selectedUser.last_name || ''}</h4>
                   <p className="text-sm text-gray-500">Customer Account</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-sm font-semibold text-gray-500 col-span-1">Email</span>
                <span className="text-sm text-gray-900 col-span-2 break-words">{selectedUser.email || 'N/A'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-sm font-semibold text-gray-500 col-span-1">Contact No.</span>
                <span className="text-sm text-gray-900 col-span-2">{selectedUser.contactNumber || 'Not provided'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-sm font-semibold text-gray-500 col-span-1">Location</span>
                <span className="text-sm text-gray-900 col-span-2 capitalize">{selectedUser.location || 'Not provided'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-sm font-semibold text-gray-500 col-span-1">Joined Date</span>
                <span className="text-sm text-gray-900 col-span-2">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-3">
                <span className="text-sm font-semibold text-gray-500 col-span-1">Status</span>
                <span className="text-sm col-span-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedUser.status === 'verified' ? 'text-green-600 bg-green-50' : 
                    selectedUser.status === 'pending' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {selectedUser.status === 'verified' ? 'Active' : (selectedUser.status || 'Unknown')}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <button 
                onClick={() => handleDeleteUser(selectedUser._id || selectedUser.id)}
                className="text-red-500 font-bold text-sm hover:text-red-700 hover:underline transition"
              >
                Delete User
              </button>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
};

export default CustomerManagement;