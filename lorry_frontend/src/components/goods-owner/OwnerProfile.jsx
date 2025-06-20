// src/components/goods-owner/OwnerProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OwnerProfile.css';
import { fetchOwnerProfile } from '../../services/goodsOwnerService';
import { useAuth } from '../../context/AuthContext'; // For authUser

const OwnerProfile = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [originalProfile, setOriginalProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

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
        console.log(`OwnerProfile: Fetching profile for owner ID: ${authUser.id}`);
        const data = await fetchOwnerProfile(authUser.id);
        console.log('OwnerProfile: Successfully fetched data:', data);

        if (data && typeof data === 'object') {
          setOriginalProfile(data);
          setProfile(data);
        } else {
          console.error('OwnerProfile: Data is not an object or is null!', data);
          throw new Error('Received invalid data format from server for profile.');
        }
      } catch (err) {
        console.error('OwnerProfile: Detailed error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authUser]);

  const validateFields = () => {
    const newErrors = {};
    if (!profile?.fullName) newErrors.fullName = 'Full Name is required';
    if (!profile?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      newErrors.email = 'Valid email is required';
    if (!profile?.phone || !/^\+?\d{10,15}$/.test(profile.phone)) // Basic phone validation
      newErrors.phone = 'Valid phone number is required';
    // Add other validations as needed
    if (!profile?.aadhar) newErrors.aadhar = 'Aadhar is required'; // Example
    if (!profile?.companyName) newErrors.companyName = 'Company name is required';
    if (!profile?.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!profile?.paymentDetails) newErrors.paymentDetails = 'Payment details are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = async () => {
    if (isEditing) {
      if (!validateFields()) return;
      try {
        // Placeholder for save profile functionality
        console.log('OwnerProfile: Attempting to save profile (API call not implemented yet):', profile);
        // await saveOwnerProfile(profile); // This function needs to be imported and implemented
        setOriginalProfile(profile); // Optimistically update originalProfile
        alert('Profile changes would be saved here. API call needs implementation.');
        setIsEditing(false);
      } catch (saveError) {
        console.error('Error saving owner profile:', saveError);
        setError(saveError.message || 'Failed to save profile.');
      }
    } else {
      if (originalProfile) {
        setProfile({ ...originalProfile });
      }
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfile(prev => (prev ? { ...prev, [field]: value } : { [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePasswordChange_owner = () => {
    navigate('/goods-owner/dashboard?tab=change-password', { state: { activeTab: 'change-password' } });
  };

  if (loading) return <div className="GOP-loading">Loading profile...</div>; // Standardized class name
  if (error) return <div className="GOP-error-message">{error}</div>;
  if (!profile) return <div className="GOP-no-profile">No profile data available.</div>;

  return (
    <div className="GOPowner-profile">
      <h2>My Profile</h2>

      <div className="GOPprofile-section">
        <h3>Personal Information</h3>
        <div className="GOPprofile-grid">
          <div className="GOPprofile-field">
            <label>Full Name</label>
            {isEditing ? (
              <>
                <input
                  value={profile?.fullName || ''}
                  onChange={e => handleChange('fullName', e.target.value)}
                />
                {errors.fullName && <span className="GOP-error">{errors.fullName}</span>}
              </>
            ) : (
              <p>{profile?.fullName || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Email</label>
            {isEditing ? (
              <>
                <input
                  value={profile?.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                />
                {errors.email && <span className="GOP-error">{errors.email}</span>}
              </>
            ) : (
              <p>{profile?.email || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Phone</label>
            {isEditing ? (
              <>
                <input
                  value={profile?.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                />
                {errors.phone && <span className="GOP-error">{errors.phone}</span>}
              </>
            ) : (
              <p>{profile?.phone || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Aadhar Number</label>
            {isEditing ? (
              <>
                <input
                  value={profile?.aadhar || ''}
                  onChange={e => handleChange('aadhar', e.target.value)}
                />
                {errors.aadhar && <span className="GOP-error">{errors.aadhar}</span>}
              </>
            ) : (
              <p>{profile?.aadhar || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Company Name</label>
            {isEditing ? (
              <>
                <input
                  value={profile?.companyName || ''}
                  onChange={e => handleChange('companyName', e.target.value)}
                />
                {errors.companyName && <span className="GOP-error">{errors.companyName}</span>}
              </>
            ) : (
              <p>{profile?.companyName || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="GOPprofile-section">
        <h3>Payment Information</h3>
        <div className="GOPprofile-grid">
          <div className="GOPprofile-field">
            <label>Primary Payment Method</label>
            {isEditing ? (
              <>
                <select
                  value={profile?.paymentMethod || ''}
                  onChange={e => handleChange('paymentMethod', e.target.value)}
                >
                  <option value="">Select Method</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                {errors.paymentMethod && <span className="GOP-error">{errors.paymentMethod}</span>}
              </>
            ) : (
              <p>{profile?.paymentMethod || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Payment Details</label>
            {isEditing ? (
              <>
              <input
                value={profile?.paymentDetails || ''}
                onChange={e => handleChange('paymentDetails', e.target.value)}
              />
              {errors.paymentDetails && <span className="GOP-error">{errors.paymentDetails}</span>}
              </>
            ) : (
              <p>{profile?.paymentDetails || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* <button className="GOPedit-btn">Edit Profile</button> */}
      <div className="GOPprofile-actions">
        <button className="GOPedit-btn" onClick={handleEdit}>
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
        {isEditing && (
          <button className="GOPcancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
      <button
                className="AP-change-password-btn"
                onClick={handlePasswordChange_owner}
            >
                Change Password
            </button>
    </div>
  );
};

export default OwnerProfile;