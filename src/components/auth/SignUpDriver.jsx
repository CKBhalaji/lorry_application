import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpDriver.css';
import { signUpDriver } from '../../services/authService';
import { sendOTP, verifyOTP } from '../../services/authService';

const SignUpDriver = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [fileErrors, setFileErrors] = useState({});
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const driver = 'DRIVER';

  const navigate = useNavigate();

  const MAX_FILE_SIZE_MB = 15;

  const sendVerificationEmail = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address');
      return;
    }
  
    try {
      // This endpoint should check email existence and send OTP
      const response = await fetch(`http://localhost:8080/api/drivers/check-email?email=${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email}),
      });
  
      if (response.status === 409) {
        throw new Error('Email already registered');
      }
      
      if (!response.ok) {
        throw new Error('Email check failed');
      }
  
      // Proceed with OTP
      await sendOTP(email);
      alert('OTP sent successfully');
      
    } catch (error) {
      if (error.message.includes('already registered')) {
        alert(error.message);
        setEmail('');
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyOTP(email, verificationCode);
      setIsVerified(true);
    } catch (error) {
      setIsVerified(false);
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
        return;
      }
      // Store the file based on field name
      switch (fieldName) {
        case 'driver-license':
          setDrivingLicenseFile(file);
          break;
        case 'driver-insurance':
          setInsuranceFile(file);
          break;
      }
      setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleVehicleNameChange = (e) => {
    setVehicleName(e.target.value);
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

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
  };

  const handleVehicleTypeChange = (e) => {
    const value = e.target.value;
    setVehicleType(value);
    if (value !== 'others') {
      setCustomVehicleType('');
    }
  };

  const handleCustomVehicleTypeChange = (e) => {
    setCustomVehicleType(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = true;

    // Validate other fields only if email is verified
    if (isVerified) {
      const username = document.getElementById('driver-username').value;
      if (!username) newErrors.username = true;

      const phone = document.getElementById('driver-phone').value;
      if (!phone.match(/^[0-9]{10}$/)) newErrors.phone = true;

      const aadhar = document.getElementById('driver-aadhar').value;
      if (!aadhar.match(/^[0-9]{12}$/)) newErrors.aadhar = true;

      const experience = document.getElementById('driver-experience').value;
      if (experience < 0) newErrors.experience = true;

      if (vehicleType === 'others' && !customVehicleType) {
        newErrors.vehicleType = true;
      }

      if (strength !== 'Strong') newErrors.password = true;

      if (fileErrors['driver-license']) newErrors.driverLicense = true;
      if (fileErrors['driver-insurance']) newErrors.driverInsurance = true;

      const rcCard = document.getElementById('driver-rc-card').value;
      if (!rcCard.match(/^[A-Za-z0-9]{8,20}$/)) newErrors.rcCard = true;

      const vehicleName = document.getElementById('vehicle-name').value;
      if (!vehicleName) newErrors.vehicleName = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formData = new FormData();

      const driverData = {
        username: document.getElementById('driver-username').value,
        phoneNumber: document.getElementById('driver-phone').value,
        aadharNumber: document.getElementById('driver-aadhar').value,
        email,
        experience: document.getElementById('driver-experience').value,
        rcCardNumber: document.getElementById('driver-rc-card').value, // RC number
        customVehicleType: vehicleName,
        vehicleType: vehicleType === 'others' ? customVehicleType : vehicleType,
        loadCapacityKg: document.getElementById('vehicle-load').value,
        payemtDetail: document.querySelector('input[name="payment-method"]:checked').value,
        paymentID: document.getElementById('payment-id').value, // Add this input field
        password,
        role: [driver]
      };

      formData.append('driver', new Blob([JSON.stringify(driverData)], {
        type: 'application/json'
      }));

      if (drivingLicenseFile) formData.append('drivingLicense', drivingLicenseFile);
      if (insuranceFile) formData.append('insurance', insuranceFile);

      try {
        await signUpDriver(formData);
        alert('Driver signed up successfully!');
        navigate(-1);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert(`Failed to sign up: ${error.message}`);
      }
    } else {
      alert('Please fix the errors in the form.');
    }
  };

  return (
    <div className="driver-signup-container">
      <h1 className="driver-signup-title">Driver Sign Up</h1>
      <div className="driver-signup-layout">
        {/* Left Section: Email Verification */}
        <div className="driver-signup-left">
          <label htmlFor="driver-email" className="driver-signup-label">Email</label>
          <input
            id="driver-email"
            type="email"
            className={`driver-signup-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isVerified}
          />
          {!isVerified && (
            <>
              <button type="button" onClick={sendVerificationEmail} className="driver-signup-button">
                Send Verification Code
              </button>
              <label htmlFor="verification-code" className="driver-signup-label">Verification Code</label>
              <input
                id="verification-code"
                type="text"
                className="driver-signup-input"
                placeholder="Enter the code sent to your email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}

                required
              />
              <button type="button" onClick={handleVerifyCode} className="driver-signup-button">
                Verify Code
              </button>
            </>
          )}
        </div>

        {/* Right Section: Other Details */}
        <div className={`driver-signup-right ${isVerified ? '' : 'disabled'}`}>
          <form className="driver-signup-form" onSubmit={handleSubmit} >
            <label htmlFor="driver-username" className="driver-signup-label">Username</label>
            <input
              id="driver-username"
              type="text"
              className={`driver-signup-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              required
              disabled={!isVerified}
            />

            {/* Phone Number */}
            <label htmlFor="driver-phone" className="driver-signup-label">Phone Number</label>
            <input
              id="driver-phone"
              type="tel"
              className={`driver-signup-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"

              required
              disabled={!isVerified}
            />

            {/* Aadhar Number */}
            <label htmlFor="driver-aadhar" className="driver-signup-label">Aadhar Number</label>
            <input
              id="driver-aadhar"
              type="text"
              className={`driver-signup-input ${errors.aadhar ? 'error' : ''}`}
              placeholder="Enter your 12-digit Aadhar number"
              pattern="[0-9]{12}"

              required
              disabled={!isVerified}
            />

            {/* Experience */}
            <label htmlFor="driver-experience" className="driver-signup-label">Experience (in years)</label>
            <input
              id="driver-experience"
              type="number"
              className={`driver-signup-input ${errors.experience ? 'error' : ''}`}
              placeholder="Enter your experience"
              min="0"

              required
              disabled={!isVerified}
            />

            {/* Driving License */}
            <label htmlFor="driver-license" className="driver-signup-label">Driving License</label>
            <input
              id="driver-license"
              type="file"
              className={`driver-signup-input ${fileErrors['driver-license'] ? 'error' : ''}`}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'driver-license')}
              required
              disabled={!isVerified}
            />
            {fileErrors['driver-license'] && <p className="error-message">File size must be less than 15 MB.</p>}

            {/* Insurance */}
            <label htmlFor="driver-insurance" className="driver-signup-label">Insurance</label>
            <input
              id="driver-insurance"
              type="file"
              className={`driver-signup-input ${fileErrors['driver-insurance'] ? 'error' : ''}`}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'driver-insurance')}
              required
              disabled={!isVerified}
            />
            {fileErrors['driver-insurance'] && <p className="error-message">File size must be less than 15 MB.</p>}

            {/* RC Card Number */}
            <label htmlFor="driver-rc-card" className="driver-signup-label">RC Card Number</label>
            <input
              id="driver-rc-card"
              type="text"
              className={`driver-signup-input ${errors.rcCard ? 'error' : ''}`}
              placeholder="Enter RC card number"
              pattern="[A-Za-z0-9]{8,20}"
              required
              disabled={!isVerified}
            />
            {/* Vehicle Info */}
            <h3 className="driver-signup-section-title">Vehicle Info</h3>
            <label htmlFor="vehicle-name" className="driver-signup-label">Name</label>
            <input
              id="vehicle-name"
              type="text"
              className={`driver-signup-input ${errors.vehicleName ? 'error' : ''}`}
              placeholder="Enter vehicle name"
              value={vehicleName}
              onChange={handleVehicleNameChange}
              required
              disabled={!isVerified}
            />

            <label htmlFor="vehicle-type" className="driver-signup-label">Vehicle Type</label>
            <select
              id="vehicle-type"
              className={`driver-signup-select ${errors.vehicleType ? 'error' : ''}`}
              value={vehicleType}
              onChange={handleVehicleTypeChange}
              required
              disabled={!isVerified}
            >
              <option value="">Select vehicle type</option>
              <option value="truck">Truck</option>
              <option value="lorry">Lorry</option>
              <option value="van">Van</option>
              <option value="others">Others</option>
            </select>

            {/* Show input box if "Others" is selected */}
            {vehicleType === 'others' && (
              <input
                type="text"
                className={`driver-signup-input ${errors.vehicleType ? 'error' : ''}`}
                placeholder="Enter your vehicle type"
                value={customVehicleType}
                onChange={handleCustomVehicleTypeChange}
                required
                disabled={!isVerified}
              />
            )}

            <label htmlFor="vehicle-load" className="driver-signup-label">Load Capacity (in kg)</label>
            <input id="vehicle-load" type="number" className="driver-signup-input" placeholder="Enter load capacity" min="0" required disabled={!isVerified} />

            {/* Payment Details */}
            <h3 className="driver-signup-section-title">Payment Details</h3>
            <label className="driver-signup-checkbox">
              <input
                type="radio"
                name="payment-method"
                value="gpay"
                checked={selectedPayment === 'gpay'}
                onChange={() => handlePaymentChange('gpay')}

                disabled={!isVerified}
              /> GPay
            </label>
            <label className="driver-signup-checkbox">
              <input
                type="radio"
                name="payment-method"
                value="paytm"
                checked={selectedPayment === 'paytm'}
                onChange={() => handlePaymentChange('paytm')}

                disabled={!isVerified}
              /> Paytm
            </label>
            <label className="driver-signup-checkbox">
              <input
                type="radio"
                name="payment-method"
                value="upi"
                checked={selectedPayment === 'upi'}
                onChange={() => handlePaymentChange('upi')}

                disabled={!isVerified}
              /> UPI ID
            </label>

            {/* Show input box based on selected payment method */}
            {selectedPayment && (
              <input
                id="payment-id"
                type="text"
                className="driver-signup-input"
                placeholder={`Enter your ${selectedPayment} details`}
                required
                disabled={!isVerified}
              />
            )}

            {/* Password */}
            <label htmlFor="driver-password" className="driver-signup-label">Password</label>
            <input
              id="driver-password"
              type="password"
              className={`driver-signup-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}

              required
              disabled={!isVerified}
            />
            <div className="password-strength_driver">
              <span>Password Strength: {strength}</span>
              <div className="password-progress-bar">
                <div className="password-progress" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="driver-signup-button" disabled={!isVerified}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpDriver;
