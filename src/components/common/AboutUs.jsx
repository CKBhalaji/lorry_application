// src/pages/AboutUs.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './StaticPage.css';

const AboutUs = () => {
  const location = useLocation();
  const isGoodsOwner = location.pathname.includes('goods-owner');

  return (
    <div className={`static-page ${isGoodsOwner ? 'goods-owner' : ''}`}>
      <div className="static-content">
        <h1>About Lorry Link</h1>
        <div className="section">
          <h2>Our Mission</h2>
          <p>
            Lorry Link bridges the gap between goods owners and transport providers, 
            creating an efficient marketplace for logistics services. Our platform 
            simplifies the process of transporting goods while ensuring fair 
            compensation for drivers.
          </p>
        </div>
        <div className="section">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, Lorry Link was born out of a need to modernize 
            India's logistics industry. After witnessing the challenges faced by 
            both goods owners and transport providers, our team set out to create 
            a solution that benefits all parties in the supply chain.
          </p>
        </div>
        <div className="section">
          <h2>Our Team</h2>
          <p>
            We're a diverse team of logistics experts, technologists, and customer 
            service professionals committed to revolutionizing how goods are 
            transported across the country. Our combined experience in both 
            technology and transportation ensures we understand your needs.
          </p>
        </div>
        <div className="section">
          <h2>Why Choose Us?</h2>
          <ul>
            <li>Transparent pricing and bidding system</li>
            <li>Verified drivers and goods owners</li>
            <li>Real-time tracking and updates</li>
            <li>24/7 customer support</li>
            <li>Secure payment processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;