import axios from 'axios'; // Added import for axios, as it's used later

// Remove any legacy authToken from localStorage to enforce cookie-only storage
localStorage.removeItem('authToken');

const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://lorry-application.onrender.com') + '/api';

export const signUpDriver = async (formData) => {
  // console.log('Original formData for driver signup:', formData);
  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: 'driver', // Explicitly set role
      profile: {
        full_name: formData.profile.full_name || "",
        phone_number: formData.profile.phone_number || "",
        aadhar_number: formData.profile.aadhar_number || "",
        experience: formData.profile.experience || "",
        driving_license_filename: formData.profile.driving_license_filename || "",
        insurance_filename: formData.profile.insurance_filename || "",
        rc_card_filename: formData.profile.rc_card_filename || "",
        vehicle_type: formData.profile.vehicle_type || "",
        custom_vehicle_type: formData.profile.custom_vehicle_type || "",
        load_capacity_kg: formData.profile.load_capacity_kg ? parseInt(formData.profile.load_capacity_kg, 10) : 0,
        gpay_id: formData.profile.gpay_id || "",
        paytm_id: formData.profile.paytm_id || "",
        upi_id: formData.profile.upi_id || ""
      }
    };
    // console.log('Processed payload for driver signup:', payload);
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/signup/driver`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    // console.error('Error during driver signup:', error.message, error.response ? error.response.status : '');
    throw error.response ? error.response.data : new Error('Request failed');
  }
};

export const signUpGoodsOwner = async (goodsOwnerData) => {
  // console.log('Original goodsOwnerData for signup:', goodsOwnerData);
  try {
    const payload = {
      username: goodsOwnerData.username,
      email: goodsOwnerData.email,
      password: goodsOwnerData.password,
      role: 'goods_owner', // Explicitly set role
      profile: {
        full_name: goodsOwnerData.full_name,
        company_name: goodsOwnerData.companyName,
        gst_number: goodsOwnerData.gstNumber,
        phone_number: goodsOwnerData.phone // Ensure this matches your form field
        // Add any other fields from goodsOwnerData that should be in profile
      }
    };
    // console.log('Processed payload for goods owner signup:', payload);
    // Assuming goodsOwnerData is structured correctly for the backend:
    // { username, email, password, role, profile: { company_name, ... } }
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/signup/goods-owner`, payload);
    return response.data;
  } catch (error) {
    // console.error('Error during goods owner signup:', error.message, error.response ? error.response.status : '');
    throw error.response ? error.response.data : new Error('Request failed');
  }
};

export const login = async (credentials) => {
  try {
    const params = new URLSearchParams();
    params.append('username', credentials.username); // or credentials.email if that's the field name
    params.append('password', credentials.password);

    const response = await axios.post(`${BACKEND_BASE_URL}/auth/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data; // Should be { access_token: "...", token_type: "bearer" }
  } catch (error) {
    // console.error('Error during login:', error.message, error.response ? error.response.status : '');
    throw error.response ? error.response.data : new Error('Request failed');
  }
};

export const sendOTP = async (email) => {
  try {
    // Backend /auth/verification/send expects a body like { "email": "user@example.com" }
    // The old frontend sent OTP in body too, which is not what the new backend expects.
    // The old frontend also generated OTP client-side, which is insecure.
    // The new backend's /send endpoint is just for initiating, not verifying a client-generated OTP.
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/verification/send`, { email: email }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    // console.error('Error sending OTP:', error.message, error.response ? error.response.status : '');
    throw error.response ? error.response.data : new Error('Request failed');
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    // Backend /auth/verification/verify expects { "email": "user@example.com", "otp": "1234" } in body
    const response = await axios.post(`${BACKEND_BASE_URL}/auth/verification/verify`, { email: email, otp: otp.toString() }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    // console.error('Error verifying OTP:', error.message, error.response ? error.response.status : '');
    // If error is already an Error object from response.text() failure or custom new Error:
    if (error instanceof Error) throw error;
    // Else, wrap it or use a generic one
    throw error.response ? error.response.data : new Error('Request failed');
  }
};