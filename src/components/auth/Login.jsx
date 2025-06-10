import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { logindriver } from '../../services/authService'; // Import the driver login service

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

  // const handleDriverLogin = async () => {
  //   const userData = {
  //     type: 'driver',
  //     username: driverUsername,
  //     // Add other necessary fields
  //   };
  //   console.log('Attempting driver login with:', userData);
  //   login(userData);
  //   navigate('/driver');
  // };

  const handleDriverLogin = async () => {
    try {
      // Clear previous errors
      setErrorMessage('');

      // Validate inputs
      if (!driverUsername || !driverPassword) {
        setErrorMessage('Please fill in all fields');
        return;
      }

      const userData = {
        type: 'driver',
        username: driverUsername,
        // Add other necessary fields
      };

      // Call authentication service
      const response = await logindriver({
        username: driverUsername,
        password: driverPassword
      });

      // Handle successful login
      login({
        type: 'driver',
        token: response.token, // Assuming your backend returns a token
        user: {
        username: response.username, // Username from the backend
        email: response.email      // Email from the backend
      }
      });

      localStorage.setItem('token', response.token); // Store the token

      login(userData);
      navigate('/driver');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
    }
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
        <div className="full-size black">
          <h1>For Drivers</h1>
          <div id="login">
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="username-driver">Username</label>
              <input
                id="username-driver"
                type="username"
                placeholder="Enter your username"
                value={driverUsername}
                onChange={(e) => setDriverUsername(e.target.value)}
                required
              />
              <label htmlFor="password-driver">Password</label>
              <input
                id="password-driver"
                type="password"
                placeholder="Enter your password"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                required
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
                  type="username"
                  placeholder="Enter your username"
                  value={driverUsername}
                  onChange={(e) => setDriverUsername(e.target.value)}
                  required
                />
                <label htmlFor="password-driver">Password</label>
                <input
                  id="password-driver"
                  type="password"
                  placeholder="Enter your password"
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                  required
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
      )
      }
    </div >
  );
};

export default Login;
