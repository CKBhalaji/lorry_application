// src/pages/auth/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('testadmin');
  const [password, setPassword] = useState('ONEtwo@2003');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const credentials = {
      username: username,
      password: password,
      type: 'admin'
    };
    try {
      console.log('Attempting admin login with:', credentials);
      await login(credentials);
      navigate('/admin'); // Or '/admin/dashboard' if preferred
    } catch (err) {
      console.error('Admin login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="AL-admin-login-container">
      <h1>Admin Login</h1>
      <div className="AL-admin-login-box">
        {/* <h1>Admin Login</h1> */}
        <form onSubmit={handleLogin}>
          <div className="AL-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="AL-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="AL-error-message">{error}</div>}
          <button type="submit" className="AL-login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;