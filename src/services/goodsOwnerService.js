import { get, post, put } from './apiService';
import { getToken } from './authService';

const GOODS_OWNER_API_URL = '/goods-owner'; // Base path for goods owner operations

export const postLoad = async (loadData) => {
    // loadData should be: { description, pickupLocation, dropoffLocation, weight }
    const token = getToken();
    try {
        const response = await post(`${GOODS_OWNER_API_URL}/loads`, loadData, token);
        return response;
    } catch (error) {
        console.error('Error posting load:', error);
        throw error;
    }
};

export const getMyLoads = async () => {
    const token = getToken();
    try {
        const response = await get(`${GOODS_OWNER_API_URL}/loads`, token);
        return response;
    } catch (error) {
        console.error('Error fetching my loads:', error);
        throw error;
    }
};

export const getBidsForLoad = async (loadId) => {
    const token = getToken();
    try {
        // Note: The backend URL is /api/goods-owner/loads/{loadId}/bids
        const response = await get(`${GOODS_OWNER_API_URL}/loads/${loadId}/bids`, token);
        return response;
    } catch (error) {
        console.error(`Error fetching bids for load ${loadId}:`, error);
        throw error;
    }
};

export const acceptBid = async (bidId) => {
    const token = getToken();
    try {
        // Note: The backend URL is /api/goods-owner/bids/{bidId}/accept
        const response = await put(`${GOODS_OWNER_API_URL}/bids/${bidId}/accept`, {}, token); // Empty body for this PUT
        return response;
    } catch (error) {
        console.error(`Error accepting bid ${bidId}:`, error);
        throw error;
    }
};

export const raiseDispute = async (disputeData) => {
    // disputeData should be: { loadId (Long), reason (String) }
    const token = getToken();
    try {
        const response = await post(`${GOODS_OWNER_API_URL}/disputes`, disputeData, token);
        return response;
    } catch (error) {
        console.error('Error raising dispute:', error);
        throw error;
    }
};

export const getGoodsOwnerDisputes = async () => {
    const token = getToken();
    try {
        const response = await get(`${GOODS_OWNER_API_URL}/disputes`, token);
        return response;
    } catch (error) {
        console.error('Error fetching goods owner disputes:', error);
        throw error;
    }
};

export const getGoodsOwnerProfile = async () => {
    const token = getToken();
    try {
        const response = await get(`${GOODS_OWNER_API_URL}/profile`, token);
        return response;
    } catch (error) {
        console.error('Error fetching goods owner profile:', error);
        throw error;
    }
};

export const updateGoodsOwnerProfile = async (profileData) => {
    // profileData should be: { firstName, lastName, phoneNumber, email }
    const token = getToken();
    try {
        const response = await put(`${GOODS_OWNER_API_URL}/profile`, profileData, token);
        return response;
    } catch (error) {
        console.error('Error updating goods owner profile:', error);
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    // passwordData should be: { newPassword }
    const token = getToken();
    try {
        const response = await post(`${GOODS_OWNER_API_URL}/change-password`, passwordData, token);
        return response; // Typically a message response
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
