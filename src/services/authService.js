import axios from 'axios';

// export const signUpDriver = async (formData) => {
//   try {
//     const response = await fetch('http://localhost:8080/api/drivers/register', {
//       method: 'POST',
//       body: formData // Send FormData directly
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Signup failed');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error during signup:', error);
//     throw error;
//   }
// };

export const signUpDriver = async (formData) => {
  try {
    const response = await fetch('http://localhost:8080/api/drivers/register', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Log the response status and text to the console for debugging
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const signUpGoodsOwner = async (goodsOwnerData) => {
  try {
    const response = await axios.post(`${API_URL}/signup-goods-owner`, goodsOwnerData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logindriver = async (credentials) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/drivers/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await fetch(`http://localhost:8080/api/verification/send?email=${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OTP send failed');
    }
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`http://localhost:8080/api/verification/verify?email=${email}&token=${otp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorText = await response.text();
      alert(errorText || 'OTP is not correct');
      throw new Error('Failed to verify OTP');
    }
    return response.text();
  } catch (error) {
    throw error;
  }
};