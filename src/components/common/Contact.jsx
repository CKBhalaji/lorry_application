// src/pages/Contact.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './StaticPage.css';

const Contact = () => {
  const location = useLocation();
  const isGoodsOwner = location.pathname.includes('goods-owner');

  return (
    <div className={`static-page ${isGoodsOwner ? 'goods-owner' : ''}`}>
      <div className="static-content">
        <h1>Contact Us</h1>
        <div className="section">
          <h2>Customer Support</h2>
          <p>
            Our support team is available 24/7 to assist you with any questions 
            or issues you may encounter.
          </p>
          <div className="contact-method">
            <strong>Email:</strong> support@lorrylink.com
          </div>
          <div className="contact-method">
            <strong>Phone:</strong> +91 98765 43210
          </div>
          <div className="contact-method">
            <strong>Live Chat:</strong> Available through our mobile app
          </div>
        </div>
        <div className="section">
          <h2>Office Address</h2>
          <address>
            Lorry Link Technologies Pvt. Ltd.<br />
            123 Logistics Park, 5th Floor<br />
            Bangalore - 560001<br />
            Karnataka, India
          </address>
        </div>
        <div className="section">
          <h2>Business Hours</h2>
          <p>
            Monday - Friday: 9:00 AM - 6:00 PM<br />
            Saturday: 10:00 AM - 4:00 PM<br />
            Sunday: Closed
          </p>
        </div>
        <div className="section">
          <h2>Emergency Contact</h2>
          <p>
            For urgent issues related to active shipments:<br />
            <strong>Phone:</strong> +91 98765 43211 (24/7)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;