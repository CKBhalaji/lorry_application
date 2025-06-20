import axios from 'axios';

// src/services/driverService.js
const API_BASE_URL = 'http://localhost:8080/api/drivers';

export const fetchAvailableLoads = async () => {
  const token = localStorage.getItem('driverToken');
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
  try {
    const response = await axios.get(`/api/drivers/${driverId}/bids`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver bids:', error);
    throw error;
  }
};

export const fetchDriverProfile = async (driverId) => {
  try {
    const response = await axios.get(`/api/drivers/${driverId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    throw error;
  }
};

export const createDriverDispute = async (disputeData) => {
  try {
    const response = await axios.post('/api/driver/disputes', disputeData);
    return response.data;
  } catch (error) {
    console.error('Error creating driver dispute:', error);
    throw error;
  }
};

export const fetchDriverDisputes = async () => {
  try {
    const response = await axios.get('/api/driver/disputes');
    return response.data;
  } catch (error) {
    console.error('Error fetching driver disputes:', error);
    throw error;
  }
};
// Add more driver-related API calls as needed