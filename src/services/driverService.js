import { get, post, put } from './apiService';
import { getToken } from './authService'; // To get the JWT token

const DRIVER_API_URL = '/driver'; // Base path for driver operations

export const getAvailableLoads = async () => {
    const token = getToken();
    try {
        const response = await get(`${DRIVER_API_URL}/loads/available`, token);
        return response;
    } catch (error) {
        console.error('Error fetching available loads:', error);
        throw error;
    }
};

export const submitBid = async (bidData) => {
    // bidData should be: { loadId (Long), bidAmount (BigDecimal) }
    const token = getToken();
    try {
        const response = await post(`${DRIVER_API_URL}/bids`, bidData, token);
        return response;
    } catch (error) {
        console.error('Error submitting bid:', error);
        throw error;
    }
};

export const getBidHistory = async () => {
    const token = getToken();
    try {
        const response = await get(`${DRIVER_API_URL}/bids/history`, token);
        return response;
    } catch (error) {
        console.error('Error fetching bid history:', error);
        throw error;
    }
};

export const getAssignedLoads = async () => {
    const token = getToken();
    try {
        const response = await get(`${DRIVER_API_URL}/loads/assigned`, token);
        return response;
    } catch (error) {
        console.error('Error fetching assigned loads:', error);
        throw error;
    }
};

export const raiseDispute = async (disputeData) => {
    // disputeData should be: { loadId (Long), reason (String) }
    const token = getToken();
    try {
        const response = await post(`${DRIVER_API_URL}/disputes`, disputeData, token);
        return response;
    } catch (error) {
        console.error('Error raising dispute:', error);
        throw error;
    }
};

export const getDriverDisputes = async () => {
    const token = getToken();
    try {
        const response = await get(`${DRIVER_API_URL}/disputes`, token);
        return response;
    } catch (error) {
        console.error('Error fetching driver disputes:', error);
        throw error;
    }
};

export const getDriverProfile = async () => {
    const token = getToken();
    try {
        const response = await get(`${DRIVER_API_URL}/profile`, token);
        return response;
    } catch (error) {
        console.error('Error fetching driver profile:', error);
        throw error;
    }
};

export const updateDriverProfile = async (profileData) => {
    // profileData should be: { firstName, lastName, phoneNumber, email }
    const token = getToken();
    try {
        const response = await put(`${DRIVER_API_URL}/profile`, profileData, token);
        return response;
    } catch (error) {
        console.error('Error updating driver profile:', error);
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    // passwordData should be: { newPassword }
    const token = getToken();
    try {
        const response = await post(`${DRIVER_API_URL}/change-password`, passwordData, token);
        return response; // Typically a message response
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
