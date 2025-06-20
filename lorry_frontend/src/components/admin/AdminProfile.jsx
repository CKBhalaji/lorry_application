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
            email: data.email || '',
            profile: data.profile || data.type || '', // Use profile or type from data
            phone: data.phone || ''
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
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = '10-digit phone number required';

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
      const updatedProfile = await updateAdminProfile(authUser.id, formData); // Pass adminId
      setProfile(updatedProfile);
      setFormData({ // Reset formData with updated profile data
            name: updatedProfile.name || '',
            email: updatedProfile.email || '',
            profile: updatedProfile.profile || updatedProfile.type || '',
            phone: updatedProfile.phone || ''
      });
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
            />
            {errors.name && <span className="AP-error-message">{errors.name}</span>}
          </div>

          <div className="AP-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="AP-error-message">{errors.email}</span>}
          </div>

          <div className="AP-form-group">
            <label>Profile/Role</label>
            <select
              name="profile" // This field in formData should align with what backend expects ('profile' or 'type')
              value={formData.profile || ''}
              onChange={handleChange}
              disabled={!isSuperAdmin} // Only superadmin can change role
              className={!isSuperAdmin ? 'disabled-field' : ''}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="manager">Manager</option> {/* Ensure these roles match backend enum/values */}
            </select>
          </div>

          <div className="AP-form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="AP-error-message">{errors.phone}</span>}
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
            <span className="AP-detail-label">Email:</span>
            <span className="AP-detail-value">{profile?.email || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Profile/Role:</span>
            <span className="AP-detail-value">{profile?.profile || profile?.type || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Phone:</span>
            <span className="AP-detail-value">{profile?.phone || 'N/A'}</span>
          </div>
          <div className="AP-detail-row">
            <span className="AP-detail-label">Admin Since:</span>
            <span className="AP-detail-value">
              {profile?.createdAt && !isNaN(new Date(profile.createdAt))
                ? new Date(profile.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
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