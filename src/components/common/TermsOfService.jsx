// src/pages/TermsOfService.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './StaticPage.css';

const TermsOfService = () => {
  const location = useLocation();
  const isGoodsOwner = location.pathname.includes('goods-owner');

  return (
    <div className={`static-page ${isGoodsOwner ? 'goods-owner' : ''}`}>
      <div className="static-content">
        <h1>Terms of Service</h1>
        <div className="section">
          <p><em>Effective Date: January 1, 2023</em></p>
          <p>
            Welcome to Lorry Link. These Terms of Service govern your use of our 
            platform and services. By accessing or using our service, you agree 
            to be bound by these terms.
          </p>
        </div>
        <div className="section">
          <h2>Account Registration</h2>
          <p>
            To use our services, you must register for an account and provide 
            accurate, complete information. You are responsible for maintaining 
            the confidentiality of your account credentials.
          </p>
        </div>
        <div className="section">
          <h2>Service Description</h2>
          <p>
            Lorry Link provides a platform connecting goods owners with transport 
            providers. We are not a party to any agreements between users and do 
            not guarantee the performance of any user.
          </p>
        </div>
        <div className="section">
          <h2>User Responsibilities</h2>
          <ul>
            <li>Comply with all applicable laws and regulations</li>
            <li>Provide accurate information</li>
            <li>Pay for services as agreed</li>
            <li>Maintain appropriate insurance coverage</li>
            <li>Not engage in fraudulent activities</li>
          </ul>
        </div>
        <div className="section">
          <h2>Fees and Payments</h2>
          <p>
            Fees for services are determined through our bidding system. Payment 
            processing is handled by third-party providers, and you agree to 
            their terms as applicable.
          </p>
        </div>
        <div className="section">
          <h2>Limitation of Liability</h2>
          <p>
            Lorry Link shall not be liable for any indirect, incidental, special, 
            or consequential damages resulting from the use or inability to use 
            our services.
          </p>
        </div>
        <div className="section">
          <h2>Changes to Terms</h2>
          <p>
            We may modify these terms at any time. Continued use of our services 
            after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;