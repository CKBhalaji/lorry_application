import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SignUpGoodsOwner.css';
import { signUpGoodsOwner } from '../../services/authService';
import { sendOTP, verifyOTP } from '../../services/authService';

const SignUpGoodsOwner = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [strength, setStrength] = useState('');
  const [progress, setProgress] = useState(0); // Progress for the password strength bar
  const [errors, setErrors] = useState({});

  const navigate = useNavigate(); // Initialize useNavigate

  const sendVerificationEmail = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Incorrect email. Please correct the email.');
      return;
    }

    try {
      const otp = await sendOTP(email);
      setGeneratedCode(otp);
      alert('OTP sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // const handleVerifyCode = () => {
  //   if (verifyOTP(email, verificationCode)) {
  //     setIsVerified(false);
  //     // alert('Email verified successfully!');
  //   } else {
  //     alert('Invalid OTP. Please try again.');
  //   }
  // };

  const handleVerifyCode = async () => {
    try {
      await verifyOTP(email, verificationCode);
      setIsVerified(true);
    } catch (error) {
      setIsVerified(false);
      alert('Invalid OTP. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = true;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = true;
    if (!phone.match(/^[0-9]{10}$/)) newErrors.phone = true;
    if (!aadhar.match(/^[0-9]{12}$/)) newErrors.aadhar = true;
    if (!paymentMethod) newErrors.paymentMethod = true;
    if (password.length < 8) newErrors.password = true; // Validate password length

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPasswordStrength = (value) => {
    let score = 0;

    // Check for at least 2 numbers
    if (value.match(/(.*[0-9].*[0-9])/)) score += 1;

    // Check for at least 3 lowercase alphabets
    if (value.match(/(.*[a-z].*[a-z].*[a-z])/)) score += 1;

    // Check for at least 1 uppercase alphabet
    if (value.match(/(.*[A-Z])/)) score += 1;

    // Check for at least 1 special character
    if (value.match(/(.*[!@#$%^&*(),.?":{}|<>])/)) score += 1;

    // Check for total length of 20 characters
    if (value.length === 20) score += 1;

    // Set strength and progress
    if (score <= 1) {
      setStrength('Low');
      setProgress(20);
    } else if (score === 2 || score === 3) {
      setStrength('Mid');
      setProgress(60);
    } else if (score >= 4) {
      setStrength('Strong');
      setProgress(100);
    } else {
      setStrength('');
      setProgress(0);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formData = {
        email,
        username: name,
        phone,
        aadhar,
        paymentMethod,
        password,
      };
      try {
        console.log('Submitting driver signup payload:', formData);
        await signUpGoodsOwner(formData);
        alert('Goods owner signed up successfully!');
        navigate(-1);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to sign up. Please try again.');
      }
    } else {
      alert('Please fix the errors in the form.');
    }
  };

  return (
    <div className="goods-owner-signup-container">
      <h1 className="goods-owner-signup-title">Goods Owner Sign Up</h1>
      <div className="goods-owner-signup-layout">
        {/* Left Section: Email Verification */}
        <div className="goods-owner-signup-left">
          <label htmlFor="owner-email" className="goods-owner-signup-label">Email</label>
          <input
            id="owner-email"
            type="email"
            className={`goods-owner-signup-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isVerified}
          />
          {!isVerified && (
            <>
              <button type="button" onClick={sendVerificationEmail} className="goods-owner-signup-button">
                Send Verification Code
              </button>
              <label htmlFor="verification-code" className="goods-owner-signup-label">Verification Code</label>
              <input
                id="verification-code"
                type="text"
                className="goods-owner-signup-input"
                placeholder="Enter the code sent to your email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <button type="button" onClick={handleVerifyCode} className="goods-owner-signup-button">
                Verify Code
              </button>
            </>
          )}
        </div>

        {/* Right Section: Other Details */}
        <div className={`goods-owner-signup-right ${isVerified ? '' : 'disabled'}`}>
          <form className="goods-owner-signup-form" onSubmit={handleSubmit}>
            <label htmlFor="owner-name" className="goods-owner-signup-label">Name</label>
            <input
              id="owner-name"
              type="text"
              className={`goods-owner-signup-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!isVerified}
            />

            <label htmlFor="owner-phone" className="goods-owner-signup-label">Phone Number</label>
            <input
              id="owner-phone"
              type="tel"
              className={`goods-owner-signup-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={!isVerified}
            />

            <label htmlFor="owner-aadhar" className="goods-owner-signup-label">Aadhar Number</label>
            <input
              id="owner-aadhar"
              type="text"
              className={`goods-owner-signup-input ${errors.aadhar ? 'error' : ''}`}
              placeholder="Enter your 12-digit Aadhar number"
              value={aadhar}
              onChange={(e) => setAadhar(e.target.value)}
              required
              disabled={!isVerified}
            />

            <label htmlFor="owner-password" className="goods-owner-signup-label">Password</label>
            <input
              id="owner-password"
              type="password"
              className={`goods-owner-signup-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter a password (min 8 characters)"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={!isVerified}
            />
            <p className="password-strength_owner">
              Password Strength: {strength}
            </p>
            <div className="password-progress-bar-owner">
              <div
                className="password-progress-owner"
                style={{
                  width: `${progress}%`,
                  backgroundColor: strength === 'Low' ? 'red' :
                    strength === 'Mid' ? 'orange' :
                      strength === 'Strong' ? 'green' : 'transparent',
                }}
              ></div>
            </div>

            <label className="goods-owner-signup-label">Default Payment Details</label>
            <div className="goods-owner-signup-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  value="gpay"
                  checked={paymentMethod === 'gpay'}
                  onChange={() => setPaymentMethod('gpay')}
                  disabled={!isVerified}
                /> GPay
              </label>
              <label>
                <input
                  type="checkbox"
                  value="paytm"
                  checked={paymentMethod === 'paytm'}
                  onChange={() => setPaymentMethod('paytm')}
                  disabled={!isVerified}
                /> Paytm
              </label>
              <label>
                <input
                  type="checkbox"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  disabled={!isVerified}
                /> UPI ID
              </label>
            </div>

            <button type="submit" className="goods-owner-signup-button" disabled={!isVerified}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpGoodsOwner;
