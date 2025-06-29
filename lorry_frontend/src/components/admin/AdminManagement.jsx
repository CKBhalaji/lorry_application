// src/components/admin/AdminManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminManagement.css';
import { fetchAdmins, deleteAdmin } from '../../services/adminService';
import AddAdmin from './AddAdmin'; // Assuming this component is used elsewhere or via routing
import EditModal from './EditModal'; // Assuming this is a functional modal component
import { useAuth } from '../../context/AuthContext';

const AdminManagement = () => {
  const [adminsData, setAdminsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { authUser } = useAuth(); // Changed from currentUser to authUser for consistency with other components
  // Assuming authUser contains role, and we might need the current admin's ID for 'isCurrentUser' logic
  const currentAdminId = authUser ? authUser.id : null;
  const isSuperAdmin = authUser && authUser.type === 'superadmin'; // Assuming 'type' field holds role

  useEffect(() => {
    const loadAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        // console.log('AdminManagement: Fetching admin accounts.');
        const data = await fetchAdmins();
        // console.log('AdminManagement: Successfully fetched data:', data);
        if (!Array.isArray(data)) {
          // console.error('AdminManagement: Data is not an array!', data);
          throw new Error('Received invalid data format from server for admins.');
        }
        // Add isCurrentUser property based on fetched admin ID and current logged-in admin ID
        const processedData = data.map(admin => ({
          ...admin,
          isCurrentUser: admin.id === currentAdminId
        }));
        setAdminsData(processedData || []);
      } catch (err) {
        // console.error('AdminManagement: Detailed error fetching admins:', err);
        setError(err.message || 'Failed to fetch admin accounts. Please check console for details.');
        setAdminsData([]);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, [currentAdminId]); // Depend on currentAdminId if needed for isCurrentUser logic

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        // console.log(`AdminManagement: Deleting admin ID: ${adminId}`);
        await deleteAdmin(adminId);
        setAdminsData(currentAdmins => currentAdmins.filter(admin => admin.id !== adminId));
        // console.log(`AdminManagement: Admin ID: ${adminId} deleted successfully from UI.`);
      } catch (err) {
        // console.error('AdminManagement: Error deleting admin:', err);
        setError(err.message || `Failed to delete admin ${adminId}.`);
      }
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin); // admin object to edit
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedAdmin) => {
    // Placeholder for actual save logic (API call)
    try {
      // console.log('AdminManagement: Saving admin data (API call to be implemented):', updatedAdmin);
      // await updateAdminProfile(updatedAdmin.id, updatedAdmin); // Example service call
      setAdminsData(prevAdmins => prevAdmins.map(admin => admin.id === updatedAdmin.id ? updatedAdmin : admin));
      setShowEditModal(false);
      setSelectedAdmin(null);
      alert('Admin profile updated successfully (locally).');
    } catch (err) {
      // console.error('AdminManagement: Error saving admin profile:', err);
      setError(err.message || `Failed to update admin ${updatedAdmin.id}.`);
    }
  };


  const filteredAdmins = adminsData.filter(admin =>
    (admin.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="ADM-loading">Loading admin accounts...</div>;
  if (error) return <div className="ADM-error-message">{error}</div>;

  return (
    <div className="ADM-admin-management">
      <div className="ADM-management-header">
        <h2>Admin Management</h2>
        <div className="ADM-header-actions">
          <div className="ADM-search-box">
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isSuperAdmin && ( // Only superadmin can add new admins
            <button
              className="ADM-add-admin-btn"
              onClick={() => navigate('/admin/dashboard?tab=add-admin')} // Ensure this route is handled in AdminDashboard
            >
              Add New Admin
            </button>
          )}
        </div>
      </div>
      <div className="ADM-table-container">
        <table className="ADM-admins-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="7" className="ADM-no-results">No admin accounts found.</td>
              </tr>
            ) : (
              filteredAdmins.map((admin, index) => {
                try {
                  if (!admin || typeof admin !== 'object') {
                    // console.error(`AdminManagement: Invalid admin item at index ${index}:`, admin);
                    return (
                      <tr key={`error-${index}`} className="error-row">
                        <td colSpan="7">Invalid admin data</td>
                      </tr>
                    );
                  }
                  const id = admin.id || `missing-id-${index}`;
                  const username = admin.username || 'N/A';
                  const role = admin.role || 'N/A';
                  const email = admin.email || 'N/A';
                  const status = admin.is_active === true ? 'Active' : admin.is_active === false ? 'Inactive' : 'N/A';

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{username}</td>
                      <td>{role}</td>
                      <td>{email}</td>
                      <td>{status}</td>
                      <td>
                        {(isSuperAdmin || (authUser && authUser.type === 'admin')) && (
                          <>
                            <button
                              className="ADM-delete-btn"
                              onClick={() => handleDelete(id)}
                              disabled={admin.isCurrentUser || (role && role.toLowerCase() === 'superadmin')} // Prevent deleting self or superadmin
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                } catch (cardError) {
                  // console.error(`AdminManagement: Error rendering admin row for admin at index ${index}:`, admin, cardError);
                  return (
                    <tr key={admin && admin.id ? `error-${admin.id}` : `error-idx-${index}`} className="error-row">
                      <td colSpan="7">Error displaying this admin account.</td>
                    </tr>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>
      {showEditModal && selectedAdmin && (
        <EditModal
          admin={selectedAdmin}
          onClose={() => { setShowEditModal(false); setSelectedAdmin(null); }}
          onSave={handleSaveEdit} // Pass the save handler
          isSuperAdmin={isSuperAdmin} // Pass isSuperAdmin to modal for conditional fields
        />
      )}
    </div>
  );
};

export default AdminManagement;
