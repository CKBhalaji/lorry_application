// src/components/goods-owner/OwnerProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OwnerProfile.css';
import { fetchOwnerProfile, saveOwnerProfile } from '../../services/goodsOwnerService';
// import { useAuth } from '../../context/AuthContext'; // For authUser

const OwnerProfile = () => {
  const navigate = useNavigate();
  const [authUserError, setAuthUserError] = useState(false);
  let authUser = null;
  try {
    const raw = localStorage.getItem('authUser');
    authUser = raw ? JSON.parse(raw) : null;
    if (!authUser || typeof authUser !== 'object' || !authUser.id) {
      throw new Error();
    }
  } catch {
    setAuthUserError(true);
  }

  const [originalProfile, setOriginalProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authUserError) return;
    const loadProfile = async () => {
      if (!authUser || !authUser.id) {
        setError("User ID not found. Cannot fetch profile.");
        setLoading(false);
        return;
      }
      setLoading(false);
      setError(null);
      try {
        console.log(`OwnerProfile: Fetching profile for owner ID: ${authUser.id}`);
        const data = await fetchOwnerProfile(authUser.id);
        console.log('OwnerProfile: Successfully fetched data:', data);

        if (data && typeof data === 'object') {
          setOriginalProfile(data);
          setProfile(data);
          console.log('DEBUG PROFILE DATA:', data);
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
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!profile?.company_name || profile.company_name.trim() === '') newErrors.company_name = 'Company name is required';
    if (!profile?.gst_number || profile.gst_number.trim() === '') newErrors.gst_number = 'GST number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = async (e) => {
    console.log('handleEdit called, isEditing:', isEditing);
    if (e) e.preventDefault();
    if (isEditing) {
      if (!validateFields()) return;
      try {
        // Save profile to backend
        try {
          console.log('Attempting to save profile:', profile);
          const updated = await saveOwnerProfile(authUser.id, {
            company_name: profile.company_name,
            gst_number: profile.gst_number
          });
          console.log('Profile save response:', updated);
          // Refetch the profile from backend to ensure latest data
          const fresh = await fetchOwnerProfile(authUser.id);
          console.log('Refetched profile:', fresh);
          setOriginalProfile(fresh);
          setProfile(fresh);
          setIsEditing(false);
          setError(null);
        } catch (err) {
          console.error('Error during save:', err);
          setError(err.message || 'Failed to save profile.');
        }
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

  if (authUserError) {
    return (
      <div className="GOP-error-message">
        Invalid or missing user session. <button onClick={() => { localStorage.removeItem('authUser'); window.location.href = '/login'; }}>Go to Login</button>
      </div>
    );
  }
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
            <label>Username</label>
            <p>{profile && profile.username || 'N/A'}</p>
          </div>
          <div className="GOPprofile-field">
            <label>Email</label>
            <p>{profile && profile.email ||'N/A'}</p>
          </div>
          <div className="GOPprofile-field">
            <label>Company Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile?.company_name || ''}
                onChange={e => handleChange('company_name', e.target.value)}
              />
            ) : (
              <p>{profile?.company_name || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>GST Number</label>
            {isEditing ? (
              <input
                type="text"
                value={profile?.gst_number || ''}
                onChange={e => handleChange('gst_number', e.target.value)}
              />
            ) : (
              <p>{profile?.gst_number || 'N/A'}</p>
            )}
          </div>
          <div className="GOPprofile-field">
            <label>Profile ID</label>
            <p>{profile?.id || 'N/A'}</p>
          </div>
          <div className="GOPprofile-field">
            <label>User ID</label>
            <p>{profile?.user_id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Payment Information section removed: not available in backend */}

      {/* <button className="GOPedit-btn">Edit Profile</button> */}
      <div className="GOPprofile-actions">
        <button className="GOPedit-btn" onClick={handleEdit} type="button">
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