// src/components/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { fetchUsers, deleteUser } from '../../services/adminService';


const UserManagement = () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'driver',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'goodsOwner',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'admin',
      status: 'suspended'
    }
  ];
  // const [users, setUsers] = useState();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleView = (user) => {
    setSelectedUser(user);
  };

  // const handleDelete = (userId) => {
  //   setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  // };
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // const filteredUsers = Array.isArray(users) ? (filter === 'all'
  //   ? users
  //   : users.filter(user => user.role === filter)) : [];

  const filteredUsers = selectedRole === 'All'
    ? users
    : users.filter(user => user.role === selectedRole);

  if (loading) return <div className="UM-loading">Loading users...</div>;

  return (
    <div className="UM-user-management">
      <div className="UM-management-header">
        <h2>User Management</h2>
        <div className="UM-filter-controls">
          <label>Filter by role:</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="goodsOwner">Goods Owner</option>
            <option value="driver">Driver</option>
          </select>
        </div>
      </div>

      {selectedUser && (
        <div className="UM-user-card">
          <h3>User Details</h3>
          <div className="UM-user-details-grid">
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
          </div>
          <button className="UM-close-button" onClick={() => setSelectedUser(null)}>
            Close
          </button>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="UM-no-results">No users found</div>
      ) : (
        <div className="UM-table-container">
          <table className="UM-user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`UM-role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`UM-status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="UM-view-btn" onClick={() => handleView(user)}>View</button>
                    <button className="UM-delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div >
  );
};
export default UserManagement;


// In your JSX, add a role filter dropdown:


// Use filteredUsers instead of users in your table:
