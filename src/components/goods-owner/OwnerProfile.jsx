// src/components/goods-owner/OwnerProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';import './OwnerProfile.css';
import { fetchOwnerProfile } from '../../services/goodsOwnerService';

const OwnerProfile = () => {
  const navigate = useNavigate();
  // const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    aadhar: '1234 5678 9012',
    companyName: 'Doe Enterprises',
    paymentMethod: 'Credit Card',
    paymentDetails: '**** **** **** 1234'
  });
  const [profile, setProfile] = useState({ ...originalProfile });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!profile.fullName) newErrors.fullName = 'Full Name is required';
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      newErrors.email = 'Valid email is required';
    if (!profile.phone || !/^\+?\d{10,15}$/.test(profile.phone))
      newErrors.phone = 'Valid phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    if (isEditing) {
      if (!validateFields()) return;
      setOriginalProfile(profile);
    } else {
      setProfile({ ...originalProfile });
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchOwnerProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePasswordChange_owner = () => {
    navigate('/driver/dashboard?tab=change-password', { state: { activeTab: 'change-password' } });
    // window.location.reload(); // Force immediate refresh
};
  if (loading) return <div className="GOPloading">Loading profile...</div>;
  if (!profile) return <div className="GOPerror">Failed to load profile</div>;

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
                  value={profile.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                />
                {errors.fullName && <span className="GOPerror">{errors.fullName}</span>}
              </>
            ) : (
              <p>{profile.fullName}</p>
            )}
            {/* <p>{profile.fullName}</p> */}
          </div>
          <div className="GOPprofile-field">
            <label>Email</label>
            {isEditing ? (
              <>
                <input
                  value={profile.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
                {errors.email && <span className="GOPerror">{errors.email}</span>}
              </>
            ) : (
              <p>{profile.email}</p>
            )}
            {/* <p>{profile.email}</p> */}
          </div>
          <div className="GOPprofile-field">
            <label>Phone</label>
            {isEditing ? (
              <>
                <input
                  value={profile.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
                {errors.phone && <span className="GOPerror">{errors.phone}</span>}
              </>
            ) : (
              <p>{profile.phone}</p>
            )}
            {/* <p>{profile.phone}</p> */}
          </div>
          <div className="GOPprofile-field">
            <label>Aadhar Number</label>
            {isEditing ? (
              <>
                <input
                  value={profile.aadhar}
                  onChange={e => handleChange('aadhar', e.target.value)}
                />
                {errors.aadhar && <span className="GOPerror">{errors.aadhar}</span>}
              </>
            ) : (
              <p>{profile.aadhar}</p>
            )}
            {/* <p>{profile.aadhar}</p> */}
          </div>
          <div className="GOPprofile-field">
            <label>Company Name</label>
            {isEditing ? (
              <>
                <input
                  value={profile.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                />
                {errors.companyName && <span className="GOPerror">{errors.companyName}</span>}
              </>
            ) : (
              <p>{profile.companyName || 'Not specified'}</p>
            )}
            {/* <p>{profile.companyName || 'Not specified'}</p> */}
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
                <input
                  value={profile.paymentMethod}
                  onChange={e => handleChange('paymentMethod', e.target.value)}
                />
                {errors.paymentMethod && <span className="GOPerror">{errors.paymentMethod}</span>}
              </>
            ) : (
              <p>{profile.paymentMethod}</p>
            )}
            {/* <p>{profile.paymentMethod}</p> */}
          </div>
          <div className="GOPprofile-field">
            <label>Payment Details</label>
            {isEditing ? (
              <>
              <input
                value={profile.paymentDetails}
                onChange={e => handleChange('paymentDetails', e.target.value)}
              />
              {errors.paymentDetails && <span className="GOPerror">{errors.paymentDetails}</span>}
              </>
            ) : (
              <p>{profile.paymentDetails}</p>
            )}
            {/* <p>{profile.paymentDetails}</p> */}
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