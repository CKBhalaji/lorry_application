// src/components/admin/AdminProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProfile.css';
import { fetchAdminProfile, updateAdminProfile } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { authUser } = useAuth(); // Changed from currentUser to authUser
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', profile: '', phone: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const isSuperAdmin = authUser && authUser.type === 'superadmin'; // Assuming role is in authUser.type

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser || !authUser.id) {
        setError("User ID not found. Cannot fetch profile.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log(`AdminProfile: Fetching profile for admin ID: ${authUser.id}`);
        const data = await fetchAdminProfile(authUser.id); // Pass adminId
        console.log('AdminProfile: Successfully fetched data:', data);
        if (data && typeof data === 'object') {
          setProfile(data);
          setFormData({ // Initialize formData with fetched data
            name: data.name || '',
            username: data.username || '',
            email: data.email || '',
            role: data.role || '',
            phone_number: data.phone_number || ''
          });
        } else {
          console.error('AdminProfile: Data is not an object or is null!', data);
          throw new Error('Received invalid data format from server for admin profile.');
        }
      } catch (err) {
        console.error('AdminProfile: Detailed error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authUser]); // Depend on authUser

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone_number || !formData.phone_number.match(/^[0-9]{10}$/)) newErrors.phone_number = '10-digit phone number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (!authUser || !authUser.id) {
        throw new Error("Cannot update profile: Admin ID not found.");
      }
      console.log(`AdminProfile: Updating profile for admin ID: ${authUser.id}`, formData);
      // Only send editable fields
      const updatePayload = {
        name: formData.name,
        phone_number: formData.phone_number
      };
      const { updateAdminProfileOnly } = await import('../../services/adminService');
      const updatedProfile = await updateAdminProfileOnly(authUser.id, updatePayload); // Pass adminId
      setProfile({ ...profile, ...updatePayload });
      setFormData(prev => ({ ...prev, ...updatePayload }));
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('AdminProfile: Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      // alert('Failed to update profile. Please try again.'); // setError will display the message
    }
  };

  const handlePasswordChange = () => {
    navigate('/admin/dashboard?tab=change-password', { state: { activeTab: 'change-password' } });
  };

  if (loading) return <div className="AP-loading">Loading profile...</div>;
  if (error) return <div className="AP-error-message">{error}</div>;
  if (!profile) return <div className="AP-no-profile">No profile data available.</div>;

  return (
    <div className="AP-admin-profile">
      <div className="AP-profile-header">
        <h2>Admin Profile</h2>
        {!editMode && (
          <button
            className="AP-edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="AP-profile-form">
          <div className="AP-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              style={errors.name ? { borderColor: 'red' } : {}}
            />
            {errors.name && <span className="AP-error-message">{errors.name}</span>}
          </div>
          <div className="AP-form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={profile?.username || ''}
              readOnly
              disabled
              className="AP-readonly-field"
            />
          </div>
          <div className="AP-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile?.email || ''}
              readOnly
              disabled
              className="AP-readonly-field"
            />
          </div>
          <div className="AP-form-group">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={profile?.role || ''}
              readOnly
              disabled
              className="AP-readonly-field"
            />
          </div>
          <div className="AP-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className={errors.phone_number ? 'error' : ''}
              style={errors.phone_number ? { borderColor: 'red' } : {}}
            />
            {errors.phone_number && <span className="AP-error-message">{errors.phone_number}</span>}
          </div>
          <div className="AP-form-group">
            <label>Status</label>
            <input
              type="text"
              name="status"
              value={profile?.is_active === true ? 'Active' : profile?.is_active === false ? 'Inactive' : 'N/A'}
              readOnly
              disabled
              className="AP-readonly-field"
            />
          </div>
          <div className="AP-form-actions">
            <button
              type="button"
              className="AP-cancel-btn"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="AP-save-btn"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="AP-profile-details">
          <div className="AP-detail-row">
            <span className="AP-detail-label">Name:</span>
            <span className="AP-detail-value">{profile?.name || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Username:</span>
            <span className="AP-detail-value">{profile?.username || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Email:</span>
            <span className="AP-detail-value">{profile?.email || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Role:</span>
            <span className="AP-detail-value">{profile?.role || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Phone Number:</span>
            <span className="AP-detail-value">{profile?.phone_number || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Status:</span>
            <span className="AP-detail-value">{profile?.is_active === true ? 'Active' : profile?.is_active === false ? 'Inactive' : 'N/A'}</span>
          </div>

          <button
            className="AP-change-password-btn"
            onClick={handlePasswordChange}
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;