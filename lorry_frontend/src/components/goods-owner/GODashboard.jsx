// src/pages/goods-owner/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './GODashboard.css';
import PostLoad from './PostLoad';
import GOMyLoads from './GOMyLoads';
import OwnerProfile from './OwnerProfile';
import ManageDisputes from './GOManageDisputes';
import ChangePassword from './GOChangePassword';

const GoodsOwnerDashboard = () => {
  const location = useLocation();
  // const [activeTab, setActiveTab] = useState('post');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromURL = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromURL || 'post');

  const handleTabClick = (tab) => {
    setSearchParams({ tab });
    navigate(`/goods-owner/dashboard?tab=${tab}`);
  };

  useEffect(() => {
    if (tabFromURL) {
      setActiveTab(tabFromURL);
    }
  }, [tabFromURL]);

  // const handleLogout = () => {
  //   localStorage.removeItem('ownerToken');
  //   navigate('/login');
  // };

  return (
    <div className="GOD-owner-dashboard-baground">
      <div className="GOD-owner-dashboard">
        {/* <header className="GOD-dashboard-header">
          <h1>Goods Owner Dashboard</h1>
          <button onClick={handleLogout} className="GOD-logout-button">
            Logout
          </button>
        </header> */}

        <div className="GOD-dashboard-tabs">
          <button
            className={`GOD-tab-button ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => {setActiveTab('post'); handleTabClick('post'); }}
          >
            Post New Load
          </button>
          <button
            className={`GOD-tab-button ${activeTab === 'loads' ? 'active' : ''}`}
            onClick={() => {setActiveTab('loads'); handleTabClick('loads'); }}
          >
            My Loads
          </button>
          <button
            className={`GOD-tab-button ${activeTab === 'disputes'? 'active' : ''}`}
            onClick={() => {setActiveTab('disputes'); handleTabClick('disputes'); }}
          >
            Manage Disputes
          </button>
          <button
            className={`GOD-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {setActiveTab('profile'); handleTabClick('profile'); }}
          >
            Profile
          </button>
        </div>

        <div className="GOD-dashboard-content">
          {activeTab === 'post' && <PostLoad />}
          {activeTab === 'loads' && <GOMyLoads />}
          {activeTab === 'disputes' && <ManageDisputes />}
          {activeTab === 'profile' && <OwnerProfile />}
          {activeTab === 'change-password' && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

export default GoodsOwnerDashboard;