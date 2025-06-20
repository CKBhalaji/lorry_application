import React, { useEffect, useRef } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import truckImage from '../assets/Images/HomePageTruck.jpg';

const Home = () => {
  const truckRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const blinkInterval = setInterval(() => {
  //     if (truckRef.current) {
  //       truckRef.current.classList.add("truck-visible");
  //       setTimeout(() => {
  //         truckRef.current.classList.remove("truck-visible");
  //       }, 200);
  //     }
  //   }, 2000);

  //   return () => clearInterval(blinkInterval);
  // }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (truckRef.current) {
        truckRef.current.classList.add("truck-visible");
        setTimeout(() => {
          truckRef.current.classList.remove("truck-visible");
        }, 200);
      }
    }, 2000); // Changed from 2000 to 5000

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const element = document.querySelector('.your-element-class');
    if (element) {
      // Your existing DOM manipulation code
    }
  }, []);

  return (
    <div className='homepage-baground'>
      <div className="homepage">
        <button
          onClick={() => navigate('/admin-login')}
          className="admin-login-button"
        >
          Admin Login
        </button>
        <div className="content-container">
          <h1>Welcome to Truck Logistics</h1>
          <p className="tagline">
            <span>Your one-stop solution for managing goods</span>
            <span>transportation and driver coordination.</span>
          </p>
        </div>

        <div className="truck-container">
          <img
            ref={truckRef}
            src={truckImage}
            alt="Truck"
            className="truck"
          />
          <button onClick={() => navigate('/login')} className="login-button">
            Go to Login
          </button>
        </div>
      </div>
    </div >
  );
};

export default Home;