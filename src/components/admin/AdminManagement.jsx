// src/components/admin/AdminManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminManagement.css';
import { fetchAdmins, deleteAdmin } from '../../services/adminService';
import AddAdmin from './AddAdmin';
import EditModal from './EditModal';
import { useAuth } from '../../context/AuthContext';

const AdminManagement = () => {
  const admins = [
    {
      id: 1,
      name: 'John Doe',
      profile: 'Admin',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      createdAt: '2023-01-15T09:00:00',
      isCurrentUser: false
    },
    {
      id: 2,
      name: 'Jane Smith',
      profile: 'Super admin',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      createdAt: '2023-03-20T14:30:00',
      isCurrentUser: true
    },
    {
      id: 3,
      name: 'Michael Brown',
      profile: 'Manager',
      email: 'michael.brown@example.com',
      phone: '555-123-4567',
      createdAt: '2023-05-10T11:15:00',
      isCurrentUser: false
    }
  ];
  // const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser && currentUser.role === 'superadmin';

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const data = await fetchAdmins();
        setAdmins(data);
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAdmins();
  }, []);

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(adminId);
        setAdmins(admins.filter(admin => admin.id !== adminId));
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };


  const filteredAdmins = Array.isArray(admins) ? admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="ADM-loading">Loading admins...</div>;

  return (
    <div className="ADM-admin-management">
      <div className="ADM-management-header">
        <h2>Admin Management</h2>
        <div className="ADM-header-actions">
          <div className="ADM-search-box">
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="ADM-add-admin-btn"
            onClick={() => navigate('?tab=addAdmin')}
          >
            Add New Admin
          </button>
        </div>
      </div>
      <div className="ADM-table-container">
        <table className="ADM-admins-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Profile</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="7" className="ADM-no-results">No admins found</td>
              </tr>
            ) : (
              filteredAdmins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.profile}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="ADM-edit-btn"
                      onClick={() => handleEdit(admin)}
                    >
                      Edit
                    </button>
                    <button
                      className="ADM-delete-btn"
                      onClick={() => handleDelete(admin.id)}
                      disabled={admin.isCurrentUser}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showEditModal && (
        <EditModal
          admin={selectedAdmin}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedAdmin) => {
            // Handle save logic
          }}
        >
          <div className="ADM-edit-modal-overlay">
            <div className="ADM-edit-modal">
              <h3>Edit Admin Profile</h3>
              <form>
                <div className="ADM-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={selectedAdmin.name || ''}
                    onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                  />
                </div>
                {isSuperAdmin && (
                  <div className="ADM-form-group">
                    <label>Profile</label>
                    <input
                      type="text"
                      value={selectedAdmin.profile || ''}
                      onChange={(e) => setSelectedAdmin({ ...selectedAdmin, profile: e.target.value })}
                    />
                  </div>
                )}
                <div className="ADM-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedAdmin.email || ''}
                    onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                  />
                </div>
                <div className="ADM-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={selectedAdmin.phone || ''}
                    onChange={(e) => setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })}
                  />
                </div>
                <div className="ADM-modal-actions">
                  <button onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit">Save</button>
                </div>
              </form>
            </div>
          </div>
        </EditModal>
      )}
    </div>
  );
};

export default AdminManagement;
