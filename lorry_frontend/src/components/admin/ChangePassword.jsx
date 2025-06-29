// src/components/admin/ChangePassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';
import { changeAdminPassword } from '../../services/adminService';

// Cookie utility functions (same as in AuthContext)
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}
function removeCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Get adminId from localStorage or context if needed
      const adminUser = JSON.parse(getCookie('authUser'));
      const adminId = adminUser && adminUser.id;
      await changeAdminPassword(
        adminId,
        formData.currentPassword,
        formData.newPassword
      );
      alert('Password changed successfully!');
      navigate('/admin/dashboard?tab=admin-profile');
    } catch (error) {
      // console.error('Error changing password:', error);
      setErrors({ currentPassword: error.message || 'Failed to change password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ACP-change-password">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="ACP-form-group">
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={errors.currentPassword ? 'error' : ''}
          />
          {errors.currentPassword && (
            <span className="ACP-error-message">{errors.currentPassword}</span>
          )}
        </div>
        
        <div className="ACP-form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? 'error' : ''}
          />
          {errors.newPassword && (
            <span className="ACP-error-message">{errors.newPassword}</span>
          )}
        </div>
        
        <div className="ACP-form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && (
            <span className="ACP-error-message">{errors.confirmPassword}</span>
          )}
        </div>
        
        <div className="ACP-form-actions">
          <button 
            type="button"
            className="ACP-cancel-btn"
            onClick={() => navigate('/admin/profile')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="ACP-save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;