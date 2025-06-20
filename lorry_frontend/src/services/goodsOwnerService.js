import axios from 'axios';

// src/services/goodsOwnerService.js
const API_BASE_URL = 'http://localhost:8000/api/v1/owners';

export const postNewLoad = async (loadData) => {
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
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
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
  const response = await fetch(`${API_BASE_URL}/loads`, { // This path is correct for "get all loads for the current owner"
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch loads');
  return response.json();
};

export const fetchOwnerLoads = async (ownerId) => {
  // This function seems to be for fetching a specific owner's loads by ID.
  // The backend GET /api/v1/owners/loads is for the current authenticated owner.
  // If admin needs to fetch specific owner loads, a new backend endpoint like /admin/owners/{owner_id}/loads would be needed.
  // For now, assuming this function is intended for the currently authenticated owner,
  // in which case `fetchMyLoads` is more appropriate. Or, if it's for an admin, it needs a different endpoint.
  // Let's assume it's a duplicate or misaligned with current backend and comment for review.
  // For now, it will use the same logic as fetchMyLoads if ownerId matches current user, or fail if not admin.
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
  try {
    // This specific endpoint `/api/owners/${ownerId}/loads` does not exist on the backend.
    // The backend has GET `/api/v1/owners/loads` (all loads for the authenticated owner)
    // To make this work as intended (if for a specific owner by ID, possibly by an admin),
    // the backend would need a new endpoint.
    // For now, this will likely fail or needs to be re-routed to `${API_BASE_URL}/loads` with proper auth.
    // If we assume it's for the current user, then ownerId is redundant.
    // Let's adjust it to use the generic loads endpoint, which is implicitly for the authenticated owner.
    const response = await axios.get(`${API_BASE_URL}/loads`, { // Uses the general "my loads" endpoint
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching owner loads (by ID):', error);
    throw error;
  }
};

export const fetchOwnerProfile = async (ownerId) => {
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
  try {
    const response = await axios.get(`${API_BASE_URL}/${ownerId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    throw error;
  }
};

export const createOwnerDispute = async (disputeData) => {
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
  try {
    // Old path: /api/owner/disputes. New path should be `${API_BASE_URL}/disputes`
    const response = await axios.post(`${API_BASE_URL}/disputes`, disputeData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating owner dispute:', error);
    throw error;
  }
};

export const fetchOwnerDisputes = async () => {
  const token = localStorage.getItem('ownerToken'); // Or a generic 'authToken'
  try {
    // Old path contained `/owner/disputes`. New path is `${API_BASE_URL}/disputes`
    const response = await fetch(`${API_BASE_URL}/disputes`,{
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch owner disputes'); // Added error check for fetch
    return response.json();
  } catch (error) {
    console.error('Error fetching owner disputes:', error);
    throw error;
  }
};
// Add more owner-related API calls as needed