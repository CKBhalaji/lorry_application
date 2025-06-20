// src/pages/PrivacyPolicy.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './StaticPage.css';

const PrivacyPolicy = () => {
  const location = useLocation();
  const isGoodsOwner = location.pathname.includes('goods-owner');

  return (
    <div className={`static-page ${isGoodsOwner ? 'goods-owner' : ''}`}>
      <div className="static-content">
        <h1>Privacy Policy</h1>
        <div className="section">
          <p><em>Last Updated: January 1, 2023</em></p>
          <p>
            At Lorry Link, we are committed to protecting your privacy. This 
            Privacy Policy explains how we collect, use, disclose, and safeguard 
            your information when you use our platform.
          </p>
        </div>
        <div className="section">
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Personal identification information (Name, email, phone number, etc.)</li>
            <li>Business information (Company name, GST number, etc.)</li>
            <li>Payment information (processed securely by our payment partners)</li>
            <li>Location data (for shipment tracking)</li>
            <li>Usage data and preferences</li>
          </ul>
        </div>
        <div className="section">
          <h2>How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Process transactions</li>
            <li>Improve user experience</li>
            <li>Communicate with you</li>
            <li>Ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
        <div className="section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to 
            protect your personal data against unauthorized access, alteration, 
            disclosure, or destruction.
          </p>
        </div>
        <div className="section">
          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal 
            information. To exercise these rights, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;