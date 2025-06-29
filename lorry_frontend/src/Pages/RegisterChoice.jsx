import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterChoice.css';

const RegisterChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="register-choice-page">
      <div className="register-choice-container">
        <h1>Register as</h1>
        <div className="register-choice-buttons">
          <button
            className="cta-button primary large"
            onClick={() => navigate('/signup-driver')}
          >
            Driver
          </button>
          <button
            className="cta-button secondary large"
            onClick={() => navigate('/signup-goods-owner')}
          >
            Goods Owner
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoice;
