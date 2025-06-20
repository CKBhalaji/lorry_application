import axios from 'axios';

const API_BASE_URL = '/api/admin';

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchAllLoads = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/loads`);
    return response.data;
  } catch (error) {
    console.error('Error fetching loads:', error);
    throw error;
  }
};

export const updateLoadStatus = async (loadId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/loads/${loadId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating load status:', error);
    throw error;
  }
};

export const fetchDisputes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/disputes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching disputes:', error);
    throw error;
  }
};

export const resolveDispute = async (disputeId, resolution) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/disputes/${disputeId}/resolve`, { resolution });
    return response.data;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
};

export const addNewAdmin = async (adminData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admins`, adminData);
    return response.data;
  } catch (error) {
    console.error('Error adding new admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admins/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

export const fetchAdmins = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admins`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const fetchAdminProfile = async (adminId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admins/${adminId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const updateAdminProfile = async (adminId, profileData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admins/${adminId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};

export const changeAdminPassword = async (adminId, passwordData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admins/${adminId}/password`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing admin password:', error);
    throw error;
  }
};

