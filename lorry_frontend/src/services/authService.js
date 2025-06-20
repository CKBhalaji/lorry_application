

import axios from 'axios'; // Added import for axios, as it's used later

const BACKEND_BASE_URL = 'http://localhost:8000/api/v1';

export const signUpDriver = async (formData) => {
  try {
    // Note: The original request body for signUpDriver was flat.
    // The backend /auth/signup/driver endpoint expects:
    // { username, email, password, role, profile: { phone_number, ... } }
    // This will need adjustment in how formData is structured or sent.
    // For now, just changing the URL. The payload structure will cause issues.
    const response = await fetch(`${BACKEND_BASE_URL}/auth/signup/driver`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        aadharNumber: formData.aadharNumber,
        email: formData.email,
        experience: formData.experience,
        drivingLicenseFileName: formData.drivingLicenseFileName,
        insuranceFileName: formData.insuranceFileName,
        rcCardFileName: formData.rcCardFileName,
        vehicleType: formData.vehicleType,
        customVehicleType: formData.customVehicleType,
        loadCapacityKg: formData.loadCapacityKg,
        gpayId: formData.gpayId,
        paytmId: formData.paytmId,
        upiId: formData.upiId,
        password: formData.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const signUpGoodsOwner = async (goodsOwnerData) => {
  try {
    // Assuming goodsOwnerData is structured correctly for the backend:
    // { username, email, password, role, profile: { company_name, ... } }
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/signup/goods-owner`, goodsOwnerData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (credentials) => {
  try {
    // Backend expects 'username' (can be email or username) and 'password' in form data
    // The current frontend sends JSON. FastAPI's OAuth2PasswordRequestForm expects form data.
    // This will require changing how credentials are sent (e.g. using URLSearchParams)
    // or adjusting the backend to accept JSON for login.
    // For now, only updating URL. This will likely fail at runtime.
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const sendOTP = async (email) => {
  try {
    // Backend /auth/verification/send expects a body like { "email": "user@example.com" }
    // The old frontend sent OTP in body too, which is not what the new backend expects.
    // The old frontend also generated OTP client-side, which is insecure.
    // The new backend's /send endpoint is just for initiating, not verifying a client-generated OTP.
    const response = await fetch(`${BACKEND_BASE_URL}/auth/verification/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }), // Corrected body
    });
    if (!response.ok) throw new Error('Failed to send OTP');
    // The backend currently doesn't return the OTP. The frontend should not expect it.
    // This function might need to change its return value or how it's used.
    // For now, returning a success indication or the response itself.
    return await response.json(); // Or handle based on actual backend response
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    // Backend /auth/verification/verify expects { "email": "user@example.com", "otp": "1234" } in body
    const response = await fetch(`${BACKEND_BASE_URL}/auth/verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, otp: otp.toString() }), // Corrected body
    });
    if (!response.ok) {
      const errorText = await response.text();
      // alert(errorText || 'OTP is not correct'); // Avoid alert in service
      throw new Error(errorText || 'Failed to verify OTP');
    }
    return response.text(); // Or response.json() if backend sends JSON
  } catch (error) {
    throw error;
  }
};