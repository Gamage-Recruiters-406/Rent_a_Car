// src/pages/OwnerManagement.jsx
import React, { useState, useEffect } from 'react';
import './OwnerManagement.css'; // <--- THIS LINKS THE STYLES

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    totalUsers: 130,
    owners: 50,
    customers: 80
  };

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/owners');
        if (response.ok) {
          const data = await response.json();
          setOwners(data);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
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
    <div className="admin-container">
      <h1 className="page-title">User Management</h1>

      <div className="stats-grid">
        <div className="stat-card purple-border">
          <div className="stat-icon purple-bg">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card orange-border">
          <div className="stat-icon orange-bg">👤</div>
          <div className="stat-info">
            <h3>{stats.owners}</h3>
            <p>Owners</p>
          </div>
        </div>
        <div className="stat-card green-border">
          <div className="stat-icon green-bg">⭐</div>
          <div className="stat-info">
            <h3>{stats.customers}</h3>
            <p>Customers</p>
          </div>
        </div>
      </div>

      <div className="tab-container">
        <button className="tab-button active">Owner</button>
        <button className="tab-button inactive">Customer</button>
      </div>

      <div className="filter-container">
        <select className="status-select">
          <option>Status</option>
          <option>Active</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Loading...</td></tr>
            ) : (
              owners.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-text ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="details-btn">Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
            <button className="nav-btn">&lt; Prev</button>
            <span>Page 1 of 5</span>
            <button className="nav-btn">Next &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerManagement;