import axios from 'axios';

// src/services/goodsOwnerService.js
const API_BASE_URL = 'http://localhost:8080/api/owners';

export const postNewLoad = async (loadData) => {
  const token = localStorage.getItem('ownerToken');
  const response = await fetch(`${API_BASE_URL}/loads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(loadData)
  });
  if (!response.ok) throw new Error('Failed to post load');
  return response.json();
};

export const fetchMyLoads = async () => {
  const token = localStorage.getItem('ownerToken');
  const response = await fetch(`${API_BASE_URL}/loads`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch loads');
  return response.json();
};

export const fetchOwnerLoads = async (ownerId) => {
  try {
    const response = await axios.get(`/api/owners/${ownerId}/loads`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owner loads:', error);
    throw error;
  }
};

export const fetchOwnerProfile = async (ownerId) => {
  try {
    const response = await axios.get(`/api/owners/${ownerId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    throw error;
  }
};

export const createOwnerDispute = async (disputeData) => {
  try {
    const response = await axios.post('/api/owner/disputes', disputeData);
    return response.data;
  } catch (error) {
    console.error('Error creating owner dispute:', error);
    throw error;
  }
};

export const fetchOwnerDisputes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/owner/disputes`);
    return response.json();
  } catch (error) {
    console.error('Error fetching owner disputes:', error);
    throw error;
  }
};
// Add more owner-related API calls as needed