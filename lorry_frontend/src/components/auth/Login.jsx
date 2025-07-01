import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [driverUsername, setDriverUsername] = useState('sampled');
  const [driverPassword, setDriverPassword] = useState('sampled@123');
  const [goodsOwnerUsername, setGoodsOwnerUsername] = useState('samplego');
  const [goodsOwnerPassword, setGoodsOwnerPassword] = useState('samplego@123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedSection, setSelectedSection] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDriverLogin = async () => {
    const credentials = {
      username: driverUsername,
      password: driverPassword,
      type: 'driver',
    };
    try {
      // console.log('Attempting driver login with:', credentials);
      await login(credentials);
      navigate('/driver/dashboard?tab=loads');
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoodsOwnerLogin = async () => {
    const credentials = {
      username: goodsOwnerUsername,
      password: goodsOwnerPassword,
      type: 'goodsOwner',
    };
    try {
      // console.log('Attempting goods owner login with:', credentials);
      await login(credentials);
      navigate('/goods-owner/dashboard?tab=post');
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const renderMobileView = () => {
    if (selectedSection === 'driver') {
      return (
        <div className="full-size black">
          <h1>For Drivers</h1>
          <div id="login">
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="username-driver">Username</label>
              <input
                id="username-driver"
                type="text"
                placeholder="Enter your username"
                value={driverUsername}
                onChange={(e) => setDriverUsername(e.target.value)}
              />
              <label htmlFor="password-driver">Password</label>
              <input
                id="password-driver"
                type="password"
                placeholder="Enter your password"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                autoComplete="off"
              />
            </form>
            <button onClick={handleDriverLogin}>Login</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>
              If you don't have an account, <Link to="/signup-driver" className="ds">Sign up</Link>
            </p>
          </div>
        </div>
      );
    } else if (selectedSection === 'goods-owner') {
      return (
        <div className="full-size yellow">
          <h1>For Goods Owners</h1>
          <div id="login">
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="username-owner">Username</label>
              <input
                id="username-owner"
                type="text"
                placeholder="Enter your username"
                value={goodsOwnerUsername}
                onChange={(e) => setGoodsOwnerUsername(e.target.value)}
              />
              <label htmlFor="password-owner">Password</label>
              <input
                id="password-owner"
                type="password"
                placeholder="Enter your password"
                value={goodsOwnerPassword}
                onChange={(e) => setGoodsOwnerPassword(e.target.value)}
              />
            </form>
            <button onClick={handleGoodsOwnerLogin}>Login</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>
              If you don't have an account, <Link to="/signup-goods-owner" className="gs">Sign up</Link>
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mobile-section black">
          <h1>For Drivers</h1>
          <button className="button" onClick={() => setSelectedSection('driver')}>Get In</button>
        </div>
        <div className="mobile-section yellow">
          <h1>For Goods Owners</h1>
          <button className="button" onClick={() => setSelectedSection('goods-owner')}>Get In</button>
        </div>
      </>
    );
  };

  return (
    <div className="container">
      {isMobile ? (
        renderMobileView()
      ) : (
        <>
          <div className="black">
            <h1>For Drivers</h1>
            <div id="login">
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="username-driver">Username</label>
                <input
                  id="username-driver"
                  type="text"
                  placeholder="Enter your username"
                  value={driverUsername}
                  onChange={(e) => setDriverUsername(e.target.value)}
                />
                <label htmlFor="password-driver">Password</label>
                <input
                  id="password-driver"
                  type="password"
                  placeholder="Enter your password"
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                />
              </form>
              <button onClick={handleDriverLogin}>Login</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <p>
                If you don't have an account, <Link to="/signup-driver" className="ds">Sign up</Link>
              </p>
            </div>
          </div>
          <div className="yellow">
            <h1>For Goods Owners</h1>
            <div id="login">
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="username-owner">Username</label>
                <input
                  id="username-owner"
                  type="text"
                  placeholder="Enter your username"
                  value={goodsOwnerUsername}
                  onChange={(e) => setGoodsOwnerUsername(e.target.value)}
                />
                <label htmlFor="password-owner">Password</label>
                <input
                  id="password-owner"
                  type="password"
                  placeholder="Enter your password"
                  value={goodsOwnerPassword}
                  onChange={(e) => setGoodsOwnerPassword(e.target.value)}
                />
              </form>
              <button onClick={handleGoodsOwnerLogin}>Login</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <p>
                If you don't have an account, <Link to="/signup-goods-owner" className="gs">Sign up</Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
