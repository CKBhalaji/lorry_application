import React, { useEffect, useRef } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import truckImage from '../assets/Images/HomePageTruck.jpg';

const Home = () => {
  const truckRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (truckRef.current) {
        truckRef.current.classList.add("truck-visible");
        setTimeout(() => {
          truckRef.current.classList.remove("truck-visible");
        }, 200);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
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

        {/* New Content Sections */}
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Nationwide Coverage</h3>
            <p>We operate across all major routes with 24/7 tracking and support.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>On-Time Delivery</h3>
            <p>98% on-time delivery rate with real-time updates and alerts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Transport</h3>
            <p>Fully insured cargo with temperature-controlled options available.</p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h4>15,000+</h4>
            <p>Successful Deliveries</p>
          </div>
          <div className="stat-item">
            <h4>500+</h4>
            <p>Fleet Vehicles</p>
          </div>
          <div className="stat-item">
            <h4>24/7</h4>
            <p>Customer Support</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Ship With Us?</h2>
          <p>Join hundreds of satisfied customers who trust us with their logistics needs.</p>
          <div className="cta-buttons">
            <button className="cta-button primary" onClick={() => navigate('/register-choice')}>
              Get Started
            </button>
            <button className="cta-button secondary" onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;