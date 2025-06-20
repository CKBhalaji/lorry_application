

export const signUpDriver = async (formData) => {
  try {
    const response = await fetch('http://localhost:8080/api/drivers/signup', {
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

export const sendOTP = async (email) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const response = await fetch(`http://localhost:8080/api/verification/send?email=${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: otp.toString() }),
    });
    if (!response.ok) throw new Error('Failed to send OTP');
    return otp;
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