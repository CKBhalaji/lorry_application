import axios from 'axios';

// src/services/driverService.js
const API_BASE_URL = 'http://localhost:8000/api/v1/drivers';

export const fetchAvailableLoads = async () => {
  const token = localStorage.getItem('driverToken'); // Or a generic 'authToken'
  const response = await fetch(`${API_BASE_URL}/loads`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch loads');
  return response.json();
};

export const placeBid = async (loadId, amount) => {
  const token = localStorage.getItem('driverToken');
  const response = await fetch(`${API_BASE_URL}/bids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ loadId, amount })
  });
  if (!response.ok) throw new Error('Failed to place bid');
  return response.json();
};

export const fetchDriverBids = async (driverId) => {
  const token = localStorage.getItem('driverToken'); // Or a generic 'authToken'
  try {
    const response = await axios.get(`${API_BASE_URL}/${driverId}/bids`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching driver bids:', error);
    throw error;
  }
};

export const fetchDriverProfile = async (driverId) => {
  const token = localStorage.getItem('driverToken'); // Or a generic 'authToken'
  try {
    const response = await axios.get(`${API_BASE_URL}/${driverId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    throw error;
  }
};

export const createDriverDispute = async (disputeData) => {
  const token = localStorage.getItem('driverToken'); // Or a generic 'authToken'
  try {
    // Note: The old path was '/api/driver/disputes'. The new backend router for drivers is '/api/v1/drivers'.
    // So the new path should be `${API_BASE_URL}/disputes`.
    const response = await axios.post(`${API_BASE_URL}/disputes`, disputeData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating driver dispute:', error);
    throw error;
  }
};

export const fetchDriverDisputes = async () => {
  const token = localStorage.getItem('driverToken'); // Or a generic 'authToken'
  try {
    // Similar to createDriverDispute, path should be `${API_BASE_URL}/disputes`.
    const response = await axios.get(`${API_BASE_URL}/disputes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching driver disputes:', error);
    throw error;
  }
};
// Add more driver-related API calls as needed
export const uploadDriverDocument = async (driverId, file, docType) => {
  const token = localStorage.getItem('driverToken');;
  const formData = new FormData();
  formData.append('file', file);

  // The backend endpoint and field name may need to be adjusted to your API
  // Example: /api/v1/drivers/{driverId}/upload?docType=driving_license
  const response = await axios.post(
    `${API_BASE_URL}/${driverId}/upload?docType=${docType}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};