import axios from 'axios';

// src/services/driverService.js
const API_BASE_URL = 'http://localhost:8000/api/v1/drivers';

export const fetchAvailableLoads = async () => {
  const token = localStorage.getItem('authToken');
  console.log('DriverService: Attempting to fetch available loads.');
  console.log('DriverService: Using token:', token);
  const url = `${API_BASE_URL}/loads`;
  console.log('DriverService: Target URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('DriverService: Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('DriverService: Error fetching loads. Status:', response.status, 'Body:', errorBody);
      throw new Error(`Failed to fetch loads. Status: ${response.status}`);
    }

    console.log('DriverService: Successfully fetched loads. Preparing to parse JSON.');
    return response.json();
  } catch (error) {
    // Log network errors or errors from response.json() if they occur
    console.error('DriverService: Exception during fetchAvailableLoads:', error);
    throw error; // Re-throw the error to be caught by the calling component
  }
};

// Accept a bid
export const acceptBid = async (bidId) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/bids/${bidId}/accept`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to accept bid');
  return response.json();
};

// Decline a bid
export const declineBid = async (bidId) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/bids/${bidId}/decline`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to decline bid');
  return response.json();
};

export const placeBid = async (bidData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}/bids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bidData)
  });
  if (!response.ok) throw new Error('Failed to place bid');
  return response.json();
};

export const fetchDriverBids = async (driverId) => {
  const token = localStorage.getItem('authToken');
  console.log(`DriverService: Attempting to fetch bids for driver ID: ${driverId}.`);
  console.log('DriverService: Using token:', token);
  const url = `${API_BASE_URL}/${driverId}/bids`;
  console.log('DriverService: Target URL:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('DriverService: Response status for fetchDriverBids:', response.status);

    // Axios throws an error for non-2xx responses, so response.ok check is implicitly handled by catch block.
    // However, if we want to access response.text() for error body, we'd need to configure axios not to throw error for status codes.
    // For simplicity with current axios setup, we'll rely on its error handling.
    // If response.data is directly available, it means it was a 2xx response.

    console.log('DriverService: Successfully fetched driver bids. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`DriverService: Exception during fetchDriverBids for driver ID ${driverId}:`, error.response ? error.response.data : error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('DriverService: Error status:', error.response.status);
      console.error('DriverService: Error body:', error.response.data);
      throw new Error(`Failed to fetch driver bids. Status: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('DriverService: No response received for fetchDriverBids:', error.request);
      throw new Error('Failed to fetch driver bids: No response from server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('DriverService: Error setting up request for fetchDriverBids:', error.message);
      throw new Error(`Failed to fetch driver bids: ${error.message}`);
    }
  }
};

export const fetchDriverProfile = async (driverId) => {
  const token = localStorage.getItem('authToken');
  console.log(`DriverService: Attempting to fetch profile for driver ID: ${driverId}.`);
  console.log('DriverService: Using token:', token);
  const url = `${API_BASE_URL}/${driverId}/profile`;
  console.log('DriverService: Target URL:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('DriverService: Response status for fetchDriverProfile:', response.status);
    console.log('DriverService: Successfully fetched driver profile. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`DriverService: Exception during fetchDriverProfile for driver ID ${driverId}:`, error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('DriverService: Error status:', error.response.status);
      console.error('DriverService: Error body:', error.response.data);
      throw new Error(`Failed to fetch driver profile. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('DriverService: No response received for fetchDriverProfile:', error.request);
      throw new Error('Failed to fetch driver profile: No response from server.');
    } else {
      console.error('DriverService: Error setting up request for fetchDriverProfile:', error.message);
      throw new Error(`Failed to fetch driver profile: ${error.message}`);
    }
  }
};

export const createDriverDispute = async (disputeData) => {
  const token = localStorage.getItem('authToken'); // Or a generic 'authToken'
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
  const token = localStorage.getItem('authToken');
  console.log('DriverService: Attempting to fetch driver disputes.');
  console.log('DriverService: Using token:', token);
  const url = `${API_BASE_URL}/disputes`;
  console.log('DriverService: Target URL for fetchDriverDisputes:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('DriverService: Response status for fetchDriverDisputes:', response.status);
    console.log('DriverService: Successfully fetched driver disputes. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('DriverService: Exception during fetchDriverDisputes:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('DriverService: Error status:', error.response.status);
      console.error('DriverService: Error body:', error.response.data);
      throw new Error(`Failed to fetch driver disputes. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('DriverService: No response received for fetchDriverDisputes:', error.request);
      throw new Error('Failed to fetch driver disputes: No response from server.');
    } else {
      console.error('DriverService: Error setting up request for fetchDriverDisputes:', error.message);
      throw new Error(`Failed to fetch driver disputes: ${error.message}`);
    }
  }
};
export const updateDriverProfile = async (driverId, updatePayload) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/${driverId}/profile`;
  try {
    const response = await axios.put(url, updatePayload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to update profile');
    }
    throw error;
  }
};

// Add more driver-related API calls as needed
export const uploadDriverDocument = async (driverId, file, docType) => {
  const token = localStorage.getItem('authToken');;
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

export const changeDriverPassword = async (driverId, oldPassword, newPassword) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/${driverId}/password`;
  try {
    const response = await axios.put(url, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to change password');
    }
    throw error;
  }
};