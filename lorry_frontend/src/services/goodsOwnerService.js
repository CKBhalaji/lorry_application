import axios from 'axios';

// src/services/goodsOwnerService.js
const API_BASE_URL = 'http://localhost:8000/api/v1/owners';

export const postNewLoad = async (loadData) => {
  const token = localStorage.getItem('authToken'); // Or a generic 'authToken'
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
  const token = localStorage.getItem('authToken');
  console.log('GoodsOwnerService: Attempting to fetch my loads.');
  console.log('GoodsOwnerService: Using token:', token);
  const url = `${API_BASE_URL}/loads`;
  console.log('GoodsOwnerService: Target URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('GoodsOwnerService: Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('GoodsOwnerService: Error fetching loads. Status:', response.status, 'Body:', errorBody);
      throw new Error(`Failed to fetch loads. Status: ${response.status}`);
    }

    console.log('GoodsOwnerService: Successfully fetched loads. Preparing to parse JSON.');
    return response.json();
  } catch (error) {
    console.error('GoodsOwnerService: Exception during fetchMyLoads:', error);
    throw error; // Re-throw to be caught by the component
  }
};

export const fetchOwnerLoads = async (ownerId) => {
  // This function seems to be for fetching a specific owner's loads by ID.
  // The backend GET /api/v1/owners/loads is for the current authenticated owner.
  // If admin needs to fetch specific owner loads, a new backend endpoint like /admin/owners/{owner_id}/loads would be needed.
  // For now, assuming this function is intended for the currently authenticated owner,
  // in which case `fetchMyLoads` is more appropriate. Or, if it's for an admin, it needs a different endpoint.
  // Let's assume it's a duplicate or misaligned with current backend and comment for review.
  // For now, it will use the same logic as fetchMyLoads if ownerId matches current user, or fail if not admin.
  const token = localStorage.getItem('authToken'); // Or a generic 'authToken'
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
  const token = localStorage.getItem('authToken');
  console.log(`GoodsOwnerService: Attempting to fetch profile for owner ID: ${ownerId}.`);
  console.log('GoodsOwnerService: Using token:', token);
  const url = `${API_BASE_URL}/${ownerId}/profile`;
  console.log('GoodsOwnerService: Target URL:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GoodsOwnerService: Response status for fetchOwnerProfile:', response.status);
    console.log('GoodsOwnerService: Successfully fetched owner profile. Data:', response.data);
    // Debug: log all keys
    if (response.data && typeof response.data === 'object') {
      console.log('GoodsOwnerService: Profile keys:', Object.keys(response.data));
    }
    return response.data;
  } catch (error) {
    console.error(`GoodsOwnerService: Exception during fetchOwnerProfile for owner ID ${ownerId}:`, error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('GoodsOwnerService: Error status:', error.response.status);
      console.error('GoodsOwnerService: Error body:', error.response.data);
      throw new Error(`Failed to fetch owner profile. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('GoodsOwnerService: No response received for fetchOwnerProfile:', error.request);
      throw new Error('Failed to fetch owner profile: No response from server.');
    } else {
      console.error('GoodsOwnerService: Error setting up request for fetchOwnerProfile:', error.message);
      throw new Error(`Failed to fetch owner profile: ${error.message}`);
    }
  }
};

// Public profile fetch for drivers/loads
export const fetchOwnerPublicProfile = async (ownerId) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/${ownerId}/public-profile`;
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public owner profile:', error);
    throw error;
  }
};

export const createOwnerDispute = async (disputeData) => {
  const token = localStorage.getItem('authToken'); // Or a generic 'authToken'
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
  const token = localStorage.getItem('authToken');
  console.log('GoodsOwnerService: Attempting to fetch owner disputes.');
  console.log('GoodsOwnerService: Using token:', token);
  const url = `${API_BASE_URL}/disputes`;
  console.log('GoodsOwnerService: Target URL for fetchOwnerDisputes:', url);

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('GoodsOwnerService: Response status for fetchOwnerDisputes:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('GoodsOwnerService: Error fetching owner disputes. Status:', response.status, 'Body:', errorBody);
      throw new Error(`Failed to fetch owner disputes. Status: ${response.status}`);
    }

    console.log('GoodsOwnerService: Successfully fetched owner disputes. Preparing to parse JSON.');
    return response.json();
  } catch (error) {
    // This will catch network errors or errors from response.json()
    console.error('GoodsOwnerService: Exception during fetchOwnerDisputes:', error);
    throw error; // Re-throw to be caught by the component
  }
};
// Fetch all bids for a given load
export const fetchBidsForLoad = async (loadId) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/loads/${loadId}/bids`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch bids');
  return response.json();
};
// Add more owner-related API calls as needed

export const changeOwnerPassword = async (ownerId, oldPassword, newPassword) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/${ownerId}/password`;
  try {
    const response = await axios.put(url, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing owner password:', error);
    throw error;
  }
};

export const saveOwnerProfile = async (ownerId, profileData) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/${ownerId}/profile`;
  try {
    const response = await axios.put(url, profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving owner profile:', error);
    throw error;
  }
};