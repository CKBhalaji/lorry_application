import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpDriver.css';
import { signUpDriver, login } from '../../services/authService';
import { uploadDriverDocument } from '../../services/driverService';
import { sendOTP, verifyOTP } from '../../services/authService';

// Cookie utility function
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

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
  const [vehicleType, setVehicleType] = useState('');
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [fileErrors, setFileErrors] = useState({});

  const navigate = useNavigate();

  const MAX_FILE_SIZE_MB = 15;

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
      // console.error('Error sending email:', error);
      alert('Failed to send OTP. Please try again.');
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
    if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileErrors((prev) => ({ ...prev, [fieldName]: true }));
    } else {
      setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
    }
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
      if (fileErrors['driver-rc-card']) newErrors.driverRcCard = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formData = {
      username: document.getElementById('driver-username').value || "",
      profile: {
      full_name: document.getElementById('driver-fullname').value || "",
      phone_number: document.getElementById('driver-phone').value || "",
      aadhar_number: document.getElementById('driver-aadhar').value || "",
      experience: document.getElementById('driver-experience').value || "",
      vehicle_type: vehicleType || "",
      custom_vehicle_type: customVehicleType || "",
      load_capacity_kg: document.getElementById('vehicle-load').value ? parseInt(document.getElementById('vehicle-load').value, 10) : 0,
      driving_license_filename: document.getElementById('driver-license').files[0]?.name || "",
      insurance_filename: document.getElementById('driver-insurance').files[0]?.name || "",
      rc_card_filename: document.getElementById('driver-rc-card').files[0]?.name || "",
      gpay_id: selectedPayment === 'gpay' ? document.getElementById('payment-method').value || "" : '',
      paytm_id: selectedPayment === 'paytm' ? document.getElementById('payment-method').value || "" : '',
      upi_id: selectedPayment === 'upi' ? document.getElementById('payment-method').value || "" : '',
      },
      email: email || "",
      password: password || "",
      };

      try {
        // console.log('Submitting driver signup payload:', formData);
        const signupRes = await signUpDriver(formData);

        // Get driverId from signupRes (adjust if your backend returns a different property)
        const driverId = signupRes.id;

        // Get the files from the file inputs
        const drivingLicenseFile = document.getElementById('driver-license').files[0];
        const insuranceFile = document.getElementById('driver-insurance').files[0];
        const rcCardFile = document.getElementById('driver-rc-card').files[0];

        const loginRes = await login({ username: formData.username, password: formData.password });
        setCookie('authToken', loginRes.access_token);

        // Upload each file if present
        if (drivingLicenseFile) {
          await uploadDriverDocument(driverId, drivingLicenseFile, 'driving_license');
        }
        if (insuranceFile) {
          await uploadDriverDocument(driverId, insuranceFile, 'insurance');
        }
        if (rcCardFile) {
          await uploadDriverDocument(driverId, rcCardFile, 'rc_card');
        }

        alert('Driver signed up and documents uploaded successfully!');
        navigate(-1);
      } catch (error) {
        // console.error('Error submitting form:', error);
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

            <label htmlFor="driver-fullname" className="driver-signup-label">Full Name</label>
            <input
              id="driver-fullname"
              type="text"
              className={`driver-signup-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Enter your full name"
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

            {/* RC Card */}
            <label htmlFor="driver-rc-card" className="driver-signup-label">RC Card</label>
            <input
              id="driver-rc-card"
              type="file"
              className={`driver-signup-input ${fileErrors['driver-rc-card'] ? 'error' : ''}`}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'driver-rc-card')}
              required
              disabled={!isVerified}
            />
            {fileErrors['driver-rc-card'] && <p className="error-message">File size must be less than 15 MB.</p>}

            {/* Vehicle Info */}
            <h3 className="driver-signup-section-title">Vehicle Info</h3>
            <label htmlFor="vehicle-name" className="driver-signup-label">Name</label>
            <input id="vehicle-name" type="text" className="driver-signup-input" placeholder="Enter vehicle name" required disabled={!isVerified} />

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
                id="payment-method"
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
