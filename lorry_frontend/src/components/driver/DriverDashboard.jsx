// src/pages/driver/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './DriverDashboard.css';
import AvailableLoads from './AvailableLoads';
import DriverProfile from './DriverProfile';
import BidHistory from './BidHistory';
import ManageDisputes from './DriverManageDisputes';
import ChangePassword from './DChangePassword';

const DriverDashboard = () => {
  const location = useLocation();
  // const [activeTab, setActiveTab] = useState('loads');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromURL = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromURL || 'loads');


  const handleTabClick = (tab) => {
    setSearchParams({ tab });
    navigate(`/driver/dashboard?tab=${tab}`);
  };

  // Fetch driver data on component mount
  useEffect(() => {
    if (tabFromURL) {
      setActiveTab(tabFromURL);
    }
  }, [tabFromURL]);

  // const handleLogout = () => {
  //   localStorage.removeItem('driverToken');
  //   navigate('/login');
  // };

  return (
    <>
      <h1 style={{color: 'red', backgroundColor: 'yellow', fontSize: '30px', padding: '20px', position: 'fixed', top: '0', left: '0', zIndex: '9999' }}>DRIVER DASHBOARD TEST RENDER</h1>
      <div className="DD-driver-dashboard-baground">
        <div className="DD-driver-dashboard">
          {/* <header className="DD-dashboard-header">
          <h1>Driver Dashboard</h1>
          <button onClick={handleLogout} className="DD-logout-button">
            Logout
          </button>
        </header> */}

        <div className="DD-dashboard-tabs">
          <button
            className={`DD-tab-button ${activeTab === 'loads' ? 'active' : ''}`}
            onClick={() => {setActiveTab('loads'); handleTabClick('loads'); }}
          >
            Available Loads
          </button>
          <button
            className={`DD-tab-button ${activeTab === 'bids' ? 'active' : ''}`}
            onClick={() => {setActiveTab('bids'); handleTabClick('bids'); }}
          >
            My Bids
          </button>
          <button
            className={`DD-tab-button ${activeTab === 'disputes'? 'active' : ''}`}
            onClick={() => {setActiveTab('disputes'); handleTabClick('disputes'); }}
          >
            Manage Disputes
          </button>
          <button
            className={`DD-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {setActiveTab('profile'); handleTabClick('profile'); }}
          >
            Profile
          </button>
          {/* <button
            className={`DD-tab-button ${activeTab === 'change-password'? 'active' : ''}`}
            onClick={() => {setActiveTab('change-password'); handleTabClick('change-password'); }}
          >
            Change Password
          </button> */}
        </div>

        <div className="DD-dashboard-content">
          {activeTab === 'loads' && <AvailableLoads />}
          {activeTab === 'bids' && <BidHistory />}
          {activeTab === 'disputes' && <ManageDisputes />}
          {activeTab === 'profile' && <DriverProfile />}
          {activeTab === 'change-password' && <ChangePassword />}
        </div>
      </div>
    </div>
    </>
  );
};

export default DriverDashboard;