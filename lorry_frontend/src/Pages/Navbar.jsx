import { useAuth } from '../context/AuthContext';
import { NavLink, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import './Navbar.css'; // Add this import
import { ArrowRightOutlined, MoonOutlined, SunOutlined, MoonFilled, SunFilled, MenuOutlined, CloseOutlined } from '@ant-design/icons';


const Navbar = () => {
  const { logout, isAuthenticated, userType, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    window.location.reload();
    // console.log('User logged out successfully');
  };

  useEffect(() => {
    // Force re-render when authentication state changes
  }, [isAuthenticated, userType]);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showUserInfoDropdown, setShowUserInfoDropdown] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="NAV-navbar">
      <div className={`NAV-navbar-container ${userType === 'driver' ? 'driver' : userType === 'goods_owner' ? 'goods-owner' : ''}`}>
        <div className="NAV-navbar-header">
          <div className="NAV-navbar-brand">
            <Link to="/">
              <h1>Lorry Link </h1>
            </Link>
            {userType && (
              <Link to={
                userType === 'driver' ? '/driver' :
                  userType === 'goods_owner' ? '/goods-owner' :
                    userType === 'admin' ? '/admin' : '/'
              }>
                <span className="NAV-user-type-indicator">
                  <ArrowRightOutlined />
                  {userType === 'driver' ? ' Driver Dashboard' :
                    userType === 'goods_owner' ? ' Goods Owner' :
                      userType === 'admin' ? ' Admin Dashboard' : ''}
                </span>
              </Link>
            )}
          </div>
          {/* User Info for Desktop */}
          <div className="NAV-user-info NAV-user-info-desktop">
            {isAuthenticated && userType ? (
              <>
                <span className="NAV-username-desktop">Welcome, {username}</span>
                <button className="NAV-theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? <MoonFilled /> : <SunFilled />}
                </button>
                <button className="NAV-logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <div className="NAV-auth-links">
                <button className="NAV-theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? <MoonFilled /> : <SunFilled />}
                </button>
                <Link className="NAV-nav-link" to="/login">Login</Link>
                <div className="NAV-register-dropdown">
                  <span>Register</span>
                  <div className="NAV-register-dropdown-content">
                    <Link to="/signup-goods-owner">Goods Owner</Link>
                    <Link to="/signup-driver">Driver</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Three-dot menu for mobile/tablet */}
          <div className="NAV-user-info-mobile-menu">
            {/* Username next to 3-dot button for >=600px */}
            {isAuthenticated && userType && (
              <span className="NAV-username-next-btn">Welcome, {username}</span>
            )}
            <button className="NAV-menu-btn" onClick={() => setShowUserInfoDropdown(!showUserInfoDropdown)}>
              {showUserInfoDropdown ? <CloseOutlined /> : <MenuOutlined />}
            </button>
            {/* Side drawer overlay */}
            <div className={`NAV-user-info-drawer-overlay${showUserInfoDropdown ? ' open' : ''}`} onClick={() => setShowUserInfoDropdown(false)} />
            {/* Side drawer */}
            <div className={`NAV-user-info-drawer${showUserInfoDropdown ? ' open' : ''}`}>
              {isAuthenticated && userType ? (
                <>
                  <span className="NAV-username-mobile">Welcome, {username}</span>
                  <button className="NAV-theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <MoonFilled /> : <SunFilled />}
                  </button>
                  <button className="NAV-logout-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <div className="NAV-auth-links">
                  <button className="NAV-theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <MoonFilled /> : <SunFilled />}
                  </button>
                  <Link className="NAV-nav-link" to="/login">Login</Link>
                  <div className="NAV-register-dropdown">
                    <span>Register</span>
                    <div className="NAV-register-dropdown-content">
                      <Link to="/signup-goods-owner">Goods Owner</Link>
                      <Link to="/signup-driver">Driver</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* {isAuthenticated && (
          <div className="NAV-navbar-links">
            {userType === 'driver' && (
              <>
                <NavLink 
                  to="/driver/loads" 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  Available Loads
                </NavLink>
                <Link to="/driver/bids" className="NAV-nav-link">My Bids</Link>
                <Link to="/driver/profile" className="NAV-nav-link">Profile</Link>
              </>
            )}
            {userType === 'goods_owner' && (
              <>
                <Link to="/goods-owner/post" className="NAV-nav-link">Post Load</Link>
                <Link to="/goods-owner/loads" className="NAV-nav-link">My Loads</Link>
                <Link to="/goods-owner/profile" className="NAV-nav-link">Profile</Link>
              </>
            )}
            {userType === 'admin' && (
              <>
                <Link to="/admin/users" className="NAV-nav-link">User Management</Link>
                <Link to="/admin/loads" className="NAV-nav-link">Load Management</Link>
                <Link to="/admin/disputes" className="NAV-nav-link">Dispute Resolution</Link>
              </>
            )}
          </div>
        )} */}
      </div>
    </nav>
  );
};
export default Navbar;