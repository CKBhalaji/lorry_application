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
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchAllLoads = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/loads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching loads:', error);
    throw error;
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
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/disputes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching disputes:', error);
    throw error;
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
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/admins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const fetchAdminProfile = async (adminId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/admins/${adminId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
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

