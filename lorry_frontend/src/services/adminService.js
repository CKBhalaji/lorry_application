import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/admin';

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const fetchUsers = async () => {
  const token = localStorage.getItem('authToken');
  console.log('AdminService: Attempting to fetch users.');
  console.log('AdminService: Using token:', token);
  const url = `${API_BASE_URL}/users`;
  console.log('AdminService: Target URL for fetchUsers:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('AdminService: Response status for fetchUsers:', response.status);
    console.log('AdminService: Successfully fetched users. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('AdminService: Exception during fetchUsers:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('AdminService: Error status:', error.response.status);
      console.error('AdminService: Error body:', error.response.data);
      throw new Error(`Failed to fetch users. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('AdminService: No response received for fetchUsers:', error.request);
      throw new Error('Failed to fetch users: No response from server.');
    } else {
      console.error('AdminService: Error setting up request for fetchUsers:', error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
};

export const fetchAllLoads = async () => {
  const token = localStorage.getItem('authToken');
  console.log('AdminService: Attempting to fetch all loads.');
  console.log('AdminService: Using token:', token);
  const url = `${API_BASE_URL}/loads`;
  console.log('AdminService: Target URL for fetchAllLoads:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('AdminService: Response status for fetchAllLoads:', response.status);
    console.log('AdminService: Successfully fetched all loads. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('AdminService: Exception during fetchAllLoads:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('AdminService: Error status:', error.response.status);
      console.error('AdminService: Error body:', error.response.data);
      throw new Error(`Failed to fetch all loads. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('AdminService: No response received for fetchAllLoads:', error.request);
      throw new Error('Failed to fetch all loads: No response from server.');
    } else {
      console.error('AdminService: Error setting up request for fetchAllLoads:', error.message);
      throw new Error(`Failed to fetch all loads: ${error.message}`);
    }
  }
};

export const updateLoadStatus = async (loadId, status) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/loads/${loadId}/status`, { status }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating load status:', error);
    throw error;
  }
};

export const fetchDisputes = async () => {
  const token = localStorage.getItem('authToken');
  console.log('AdminService: Attempting to fetch all disputes.');
  console.log('AdminService: Using token:', token);
  const url = `${API_BASE_URL}/disputes`;
  console.log('AdminService: Target URL for fetchDisputes:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('AdminService: Response status for fetchDisputes:', response.status);
    console.log('AdminService: Successfully fetched all disputes. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('AdminService: Exception during fetchDisputes:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('AdminService: Error status:', error.response.status);
      console.error('AdminService: Error body:', error.response.data);
      throw new Error(`Failed to fetch all disputes. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('AdminService: No response received for fetchDisputes:', error.request);
      throw new Error('Failed to fetch all disputes: No response from server.');
    } else {
      console.error('AdminService: Error setting up request for fetchDisputes:', error.message);
      throw new Error(`Failed to fetch all disputes: ${error.message}`);
    }
  }
};

export const resolveDispute = async (disputeId, resolution) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/disputes/${disputeId}/resolve`, { resolution }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
};

export const addNewAdmin = async (adminData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/admins`, adminData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding new admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${API_BASE_URL}/admins/${adminId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

export const fetchAdmins = async () => {
  const token = localStorage.getItem('authToken');
  console.log('AdminService: Attempting to fetch all admin accounts.');
  console.log('AdminService: Using token:', token);
  const url = `${API_BASE_URL}/admins`;
  console.log('AdminService: Target URL for fetchAdmins:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('AdminService: Response status for fetchAdmins:', response.status);
    console.log('AdminService: Successfully fetched all admin accounts. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('AdminService: Exception during fetchAdmins:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('AdminService: Error status:', error.response.status);
      console.error('AdminService: Error body:', error.response.data);
      throw new Error(`Failed to fetch admin accounts. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('AdminService: No response received for fetchAdmins:', error.request);
      throw new Error('Failed to fetch admin accounts: No response from server.');
    } else {
      console.error('AdminService: Error setting up request for fetchAdmins:', error.message);
      throw new Error(`Failed to fetch admin accounts: ${error.message}`);
    }
  }
};

export const fetchAdminProfile = async (adminId) => {
  const token = localStorage.getItem('authToken');
  console.log(`AdminService: Attempting to fetch profile for admin ID: ${adminId}.`);
  console.log('AdminService: Using token:', token);
  const url = `${API_BASE_URL}/admins/${adminId}/profile`;
  console.log('AdminService: Target URL for fetchAdminProfile:', url);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('AdminService: Response status for fetchAdminProfile:', response.status);
    console.log('AdminService: Successfully fetched admin profile. Data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`AdminService: Exception during fetchAdminProfile for admin ID ${adminId}:`, error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('AdminService: Error status:', error.response.status);
      console.error('AdminService: Error body:', error.response.data);
      throw new Error(`Failed to fetch admin profile. Status: ${error.response.status}`);
    } else if (error.request) {
      console.error('AdminService: No response received for fetchAdminProfile:', error.request);
      throw new Error('Failed to fetch admin profile: No response from server.');
    } else {
      console.error('AdminService: Error setting up request for fetchAdminProfile:', error.message);
      throw new Error(`Failed to fetch admin profile: ${error.message}`);
    }
  }
};

export const updateAdminProfile = async (adminId, profileData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/admins/${adminId}/profile`, profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};

export const changeAdminPassword = async (adminId, passwordData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${API_BASE_URL}/admins/${adminId}/password`, passwordData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing admin password:', error);
    throw error;
  }
};

