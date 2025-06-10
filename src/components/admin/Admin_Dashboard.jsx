// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './Admin_Dashboard.css';
import UserManagement from './UserManagement';
import LoadManagement from './LoadManagement';
import DisputeResolution from './DisputeResolution';
import AddAdmin from './AddAdmin';
import AdminManagement from './AdminManagement';
import AdminProfile from './AdminProfile';
import ChangePassword from './ChangePassword';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromURL = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromURL || 'users');

  const handleTabClick = (tab) => {
    setSearchParams({ tab });
    navigate(`/admin/dashboard?tab=${tab}`);
  };
  // const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'users');
  // const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'tab');

  useEffect(() => {
    if (tabFromURL) {
      setActiveTab(tabFromURL);
    }
  }, [tabFromURL]);
  // useEffect(() => {
  //   if (location.state?.activeTab) {
  //     setActiveTab(location.state.activeTab);
  //   }
  // }, [location.state]);
  // const handleLogout = () => {
  //   localStorage.removeItem('adminToken');
  //   navigate('/login');
  // };

  return (
    <div className='admin-dashboard-baground'>
      <div className="admin-dashboard">
        {/* <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
          Logout
        </button> 
        </header> */}

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); handleTabClick('users'); }}
          >
            User Management
          </button>
          <button
            className={`tab-button ${activeTab === 'loads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('loads'); handleTabClick('loads'); }}
          >
            Load Management
          </button>
          <button
            className={`tab-button ${activeTab === 'disputes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('disputes'); handleTabClick('disputes'); }}
          >
            Dispute Resolution
          </button>
          <button
            className={`tab-button ${activeTab === 'admin-mangement' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin-mangement'); handleTabClick('admin-mangement'); }}
          >
            Admin Management
          </button>
          {/* <button
            className={`tab-button ${activeTab === 'addAdmin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('addAdmin'); handleTabClick('addAdmin'); }}
          >
            Add Admin
          </button> */}
          <button
            className={`tab-button ${activeTab === 'admin-profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin-profile'); handleTabClick('admin-profile'); }}
          >
            Admin Profile
          </button>
          {/* <button
            className={`tab-button ${activeTab === 'change-password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('change-password'); handleTabClick('change-password'); }}
          >
            Change Password
          </button> */}
        </div>

        <div className="dashboard-content">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'addAdmin' && <AddAdmin />}
          {activeTab === 'admin-mangement' && <AdminManagement />}
          {activeTab === 'admin-profile' && <AdminProfile />}
          {activeTab === 'change-password' && <ChangePassword />}
          {/* <Route path= "users/add" element={<AddAdmin />} /> */}
          {activeTab === 'loads' && <LoadManagement />}
          {activeTab === 'disputes' && <DisputeResolution />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;