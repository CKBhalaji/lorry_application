// src/components/common/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer-background">
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Lorry Link</h3>
            <p>Connecting drivers and goods owners efficiently</p>
            <p><a href="/login-old">Login_Old</a></p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/about-us">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@lorrylink.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Lorry Link. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;