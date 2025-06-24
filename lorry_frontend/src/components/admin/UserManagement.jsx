// src/components/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { fetchUsers, deleteUser } from '../../services/adminService';


const UserManagement = () => {
  const [usersData, setUsersData] = useState([]); // Renamed to avoid conflict
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('UserManagement: Fetching users.');
        const data = await fetchUsers();
        console.log('UserManagement: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          console.error('UserManagement: Data is not an array!', data);
          throw new Error('Received invalid data format from server for users.');
        }
        setUsersData(data || []);
      } catch (err) {
        console.error('UserManagement: Detailed error fetching users:', err);
        setError(err.message || 'Failed to fetch users. Please check console for details.');
        setUsersData([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log(`UserManagement: Deleting user ID: ${userId}`);
        await deleteUser(userId); // Service call
        setUsersData(currentUsers => currentUsers.filter(user => user.id !== userId));
        console.log(`UserManagement: User ID: ${userId} deleted successfully from UI.`);
      } catch (err) {
        console.error('UserManagement: Error deleting user:', err);
        // Optionally set an error message to display to the admin
        setError(err.message || `Failed to delete user ${userId}.`);
      }
    }
  };

  const filteredUsers = selectedRole === 'All'
    ? usersData
    : usersData.filter(user => user.role === selectedRole);

  if (loading) return <div className="UM-loading">Loading users...</div>;
  if (error) return <div className="UM-error-message">{error}</div>;

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
            <p><strong>Name:</strong> {selectedUser.username || 'N/A'}</p>
            <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
            <p><strong>Role:</strong> {selectedUser.role || 'N/A'}</p>
            <p><strong>Status:</strong> {selectedUser.is_active === true ? 'Active' : selectedUser.is_active === false ? 'Inactive' : 'N/A'}</p>
          </div>
          <button className="UM-close-button" onClick={() => setSelectedUser(null)}>
            Close
          </button>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 ? (
        <div className="UM-no-results">No users found for the selected filter.</div>
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
              {filteredUsers.map((user, index) => {
                try {
                  if (!user || typeof user !== 'object') {
                    console.error(`UserManagement: Invalid user item at index ${index}:`, user);
                    return (
                      <tr key={`error-${index}`} className="error-row">
                        <td colSpan="6">Invalid user data</td>
                      </tr>
                    );
                  }
                  const id = user.id || `missing-id-${index}`;
                  const name = user.username || 'N/A';
                  const email = user.email || 'N/A';
                  const role = user.role || 'N/A';
                  const status = user.is_active === true ? 'Active' : user.is_active === false ? 'Inactive' : 'N/A';

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{name}</td>
                      <td>{email}</td>
                      <td>
                        <span className={`UM-role-badge ${role.toLowerCase()}`}>
                          {role}
                        </span>
                      </td>
                      <td>
                        <span className={`UM-status-badge ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <button className="UM-view-btn" onClick={() => handleView(user)}>View</button>
                        <button className="UM-delete-btn" onClick={() => handleDelete(id)}>Delete</button>
                      </td>
                    </tr>
                  );
                } catch (cardError) {
                  console.error(`UserManagement: Error rendering user row for user at index ${index}:`, user, cardError);
                  return (
                    <tr key={user && user.id ? `error-${user.id}` : `error-idx-${index}`} className="error-row">
                      <td colSpan="6">Error displaying this user.</td>
                    </tr>
                  );
                }
              })}
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
