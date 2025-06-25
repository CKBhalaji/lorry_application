import axios from 'axios';

// Cookie utility functions (same as in AuthContext)
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}
function removeCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// src/services/goodsOwnerService.js
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://lorry-application.onrender.com') + '/api/owners';

export const postNewLoad = async (loadData) => {
  const token = getCookie('authToken'); // Or a generic 'authToken'
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

export const fetchMyLoads = async (status) => {
  const token = getCookie('authToken');
  console.log('GoodsOwnerService: Attempting to fetch my loads.');
  console.log('GoodsOwnerService: Using token:', token);
  let url = `${API_BASE_URL}/loads`;
  if (status) {
    url += `?status=${encodeURIComponent(status)}`;
  }
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
  // The backend GET /api/owners/loads is for the current authenticated owner.
  // If admin needs to fetch specific owner loads, a new backend endpoint like /admin/owners/{owner_id}/loads would be needed.
  // For now, assuming this function is intended for the currently authenticated owner,
  // in which case `fetchMyLoads` is more appropriate. Or, if it's for an admin, it needs a different endpoint.
  // Let's assume it's a duplicate or misaligned with current backend and comment for review.
  // For now, it will use the same logic as fetchMyLoads if ownerId matches current user, or fail if not admin.
  const token = getCookie('authToken'); // Or a generic 'authToken'
  try {
    // This specific endpoint `/api/owners/${ownerId}/loads` does not exist on the backend.
    // The backend has GET `/api/owners/loads` (all loads for the authenticated owner)
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
  const token = getCookie('authToken');
  const userRaw = getCookie('authUser');
  let userType = null;
  try {
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      userType = userObj.type;
    }
  } catch (e) {
    userType = null;
  }
  if (userType !== 'goods_owner') {
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('You must be logged in as a goods owner to view this profile.');
  }
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
      if (error.response.status === 403) {
        removeCookie('authToken');
        removeCookie('authUser');
        window.location.href = '/login';
        throw new Error('Access denied. Please log in as a goods owner.');
      }
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
  const token = getCookie('authToken');
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
  const token = getCookie('authToken'); // Or a generic 'authToken'
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
  const token = getCookie('authToken');
  const userRaw = getCookie('authUser');
  let userType = null;
  try {
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      userType = userObj.type;
    }
  } catch (e) {
    userType = null;
  }
  if (userType !== 'goods_owner') {
    // Optionally clear cookies and redirect
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('You must be logged in as a goods owner to view disputes.');
  }
  console.log('GoodsOwnerService: Attempting to fetch owner disputes.');
  console.log('GoodsOwnerService: Using token:', token);
  const url = `${API_BASE_URL}/disputes`;
  console.log('GoodsOwnerService: Target URL for fetchOwnerDisputes:', url);

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('GoodsOwnerService: Response status for fetchOwnerDisputes:', response.status);

    if (response.status === 403) {
      // Clear cookies and redirect to login
      removeCookie('authToken');
      removeCookie('authUser');
      window.location.href = '/login';
      throw new Error('Access denied. Please log in as a goods owner.');
    }

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
  const token = getCookie('authToken');
  const userRaw = getCookie('authUser');
  let userType = null;
  try {
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      userType = userObj.type;
    }
  } catch (e) {
    userType = null;
  }
  if (userType !== 'goods_owner') {
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('You must be logged in as a goods owner to view bids.');
  }
  const response = await fetch(`${API_BASE_URL}/loads/${loadId}/bids`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (response.status === 403) {
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('Access denied. Please log in as a goods owner.');
  }
  if (!response.ok) throw new Error('Failed to fetch bids');
  return response.json();
};
// Hire a driver for a load
export const hireDriverForLoad = async (loadId, driverId) => {
  const token = getCookie('authToken');
  const url = `${API_BASE_URL}/loads/${loadId}/hire?driver_id=${driverId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to hire driver');
  return response.json();
};
// Add more owner-related API calls as needed

export const cancelLoad = async (loadId) => {
  const token = getCookie('authToken');
  const url = `${API_BASE_URL}/loads/${loadId}/cancel`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to cancel load');
  return response.json();
};

export const changeOwnerPassword = async (ownerId, oldPassword, newPassword) => {
  const token = getCookie('authToken');
  const userRaw = getCookie('authUser');
  let userType = null;
  try {
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      userType = userObj.type;
    }
  } catch (e) {
    userType = null;
  }
  if (userType !== 'goods_owner') {
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('You must be logged in as a goods owner to change the password.');
  }
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
    if (error.response && error.response.status === 403) {
      removeCookie('authToken');
      removeCookie('authUser');
      window.location.href = '/login';
      throw new Error('Access denied. Please log in as a goods owner.');
    }
    console.error('Error changing owner password:', error);
    throw error;
  }
};

export const saveOwnerProfile = async (ownerId, profileData) => {
  const token = getCookie('authToken');
  const userRaw = getCookie('authUser');
  let userType = null;
  try {
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      userType = userObj.type;
    }
  } catch (e) {
    userType = null;
  }
  if (userType !== 'goods_owner') {
    removeCookie('authToken');
    removeCookie('authUser');
    window.location.href = '/login';
    throw new Error('You must be logged in as a goods owner to edit this profile.');
  }
  const url = `${API_BASE_URL}/${ownerId}/profile`;
  try {
    const response = await axios.put(url, profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      removeCookie('authToken');
      removeCookie('authUser');
      window.location.href = '/login';
      throw new Error('Access denied. Please log in as a goods owner.');
    }
    console.error('Error saving owner profile:', error);
    throw error;
  }
};