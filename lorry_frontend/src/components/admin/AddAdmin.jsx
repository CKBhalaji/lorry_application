// src/components/admin/AddAdmin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import './AddAdmin.css';
import { addNewAdmin } from '../../services/adminService';

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    profile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState('');

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
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = '10-digit phone number required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    if (!role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addNewAdmin({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: role.toLowerCase().replace(' ', ''), // 'Super Admin' -> 'superadmin', etc.
        phone_number: formData.phone_number || formData.phone
      });
      alert('Admin added successfully!');
      navigate('/admin/dashboard?tab=addAdmin');
    } catch (error) {
      // console.error('Error adding admin:', error);
      alert(error.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="AA-add-admin">
      <h2>Add New Admin</h2>
      <form onSubmit={handleSubmit}>
        <div className="AA-form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="AA-error-message">{errors.name}</span>}
        </div>
        <div className="AA-form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <span className="AA-error-message">{errors.username}</span>}
        </div>

        <div className="AA-form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="AA-error-message">{errors.email}</span>}
        </div>

        <div className="AA-form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="AA-error-message">{errors.phone}</span>}
        </div>

        <div className="AA-form-group">
        <label>Role</label>
          <div className="select-container">
            <Select
              label="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="superadmin">Super Admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </div>
          {errors.role && <span className="AA-error-message">{errors.role}</span>}
        </div>

        <div className="AA-form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="AA-error-message">{errors.password}</span>}
        </div>

        <div className="AA-form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && (
            <span className="AA-error-message">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="AA-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Admin'}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;