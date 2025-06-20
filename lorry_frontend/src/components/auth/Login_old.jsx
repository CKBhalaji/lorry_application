import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login_old.css';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [driverUsername, setDriverUsername] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [goodsOwnerUsername, setGoodsOwnerUsername] = useState('');
  const [goodsOwnerPassword, setGoodsOwnerPassword] = useState('');
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
    const userData = {
      type: 'driver',
      username: driverUsername,
      // Add other necessary fields
    };
    console.log('Attempting driver login with:', userData);
    login(userData);
    navigate('/driver');
  };

  const handleGoodsOwnerLogin = async () => {
    const userData = {
      type: 'goodsOwner',
      username: goodsOwnerUsername,
      // Add other necessary fields
    };
    console.log('Attempting goods owner login with:', userData);
    login(userData);
    navigate('/goods-owner');
  };

  const renderMobileView = () => {
    if (selectedSection === 'driver') {
      return (
        <div className="LOO-full-size LOO-black">
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
                autoComplete="off"
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
            {errorMessage && <p className="LOO-error-message">{errorMessage}</p>}
            <p>
              If you don't have an account, <Link to="/signup-driver" className="LOO-ds">Sign up</Link>
            </p>
          </div>
        </div>
      );
    } else if (selectedSection === 'goods-owner') {
      return (
        <div className="LOO-full-size LOO-yellow">
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
                autoComplete="off"
              />
              <label htmlFor="password-owner">Password</label>
              <input
                id="password-owner"
                type="password"
                placeholder="Enter your password"
                value={goodsOwnerPassword}
                onChange={(e) => setGoodsOwnerPassword(e.target.value)}
                autoComplete="off"
              />
            </form>
            <button onClick={handleGoodsOwnerLogin}>Login</button>
            {errorMessage && <p className="LOO-error-message">{errorMessage}</p>}
            <p>
              If you don't have an account, <Link to="/signup-goods-owner" className="LOO-gs">Sign up</Link>
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="LOO-mobile-section LOO-black">
          <h1>For Drivers</h1>
          <button className="LOO-button" onClick={() => setSelectedSection('driver')}>Get In</button>
        </div>
        <div className="LOO-mobile-section LOO-yellow">
          <h1>For Goods Owners</h1>
          <button className="LOO-button" onClick={() => setSelectedSection('goods-owner')}>Get In</button>
        </div>
      </>
    );
  };

  return (
    <div className="LOO-container">
      {isMobile ? (
        renderMobileView()
      ) : (
        <>
          <div className="LOO-black">
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
                  autoComplete="off"
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
              {errorMessage && <p className="LOO-error-message">{errorMessage}</p>}
              <p>
                If you don't have an account, <Link to="/signup-driver" className="LOO-ds">Sign up</Link>
              </p>
            </div>
          </div>
          <div className="LOO-yellow">
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
                  autoComplete="off"
                />
                <label htmlFor="password-owner">Password</label>
                <input
                  id="password-owner"
                  type="password"
                  placeholder="Enter your password"
                  value={goodsOwnerPassword}
                  onChange={(e) => setGoodsOwnerPassword(e.target.value)}
                  autoComplete="off"
                />
              </form>
              <button onClick={handleGoodsOwnerLogin}>Login</button>
              {errorMessage && <p className="LOO-error-message">{errorMessage}</p>}
              <p>
                If you don't have an account, <Link to="/signup-goods-owner" className="LOO-gs">Sign up</Link>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
