import { get, put, del } from './apiService'; // Assuming 'del' is the export for DELETE
import { getToken } from './authService';

const ADMIN_API_URL = '/admin'; // Base path for admin operations from Spring Boot backend

export const getAllUsers = async () => {
    const token = getToken();
    try {
        const response = await get(`${ADMIN_API_URL}/users`, token);
        return response;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

export const updateUserEnabledStatus = async (userId, enabled) => {
    const token = getToken();
    try {
        // The backend expects PUT /api/admin/users/{id}/status with body {"enabled": true/false}
        const response = await put(`${ADMIN_API_URL}/users/${userId}/status`, { enabled }, token);
        return response;
    } catch (error) {
        console.error(`Error updating user ${userId} status:`, error);
        throw error;
    }
};

export const getAllLoads = async () => {
    const token = getToken();
    try {
        const response = await get(`${ADMIN_API_URL}/loads`, token);
        return response;
    } catch (error) {
        console.error('Error fetching all loads:', error);
        throw error;
    }
};

export const updateLoadStatus = async (loadId, status) => {
    const token = getToken();
    try {
        // The backend expects PUT /api/admin/loads/{id}/status with body {"status": "NEW_STATUS"}
        const response = await put(`${ADMIN_API_URL}/loads/${loadId}/status`, { status }, token);
        return response;
    } catch (error) {
        console.error(`Error updating load ${loadId} status:`, error);
        throw error;
    }
};

export const getAllDisputes = async () => {
    const token = getToken();
    try {
        const response = await get(`${ADMIN_API_URL}/disputes`, token);
        return response;
    } catch (error) {
        console.error('Error fetching all disputes:', error);
        throw error;
    }
};

export const updateDisputeStatus = async (disputeId, status) => {
    const token = getToken();
    try {
        // The backend expects PUT /api/admin/disputes/{id}/status with body {"status": "NEW_STATUS"}
        const response = await put(`${ADMIN_API_URL}/disputes/${disputeId}/status`, { status }, token);
        return response;
    } catch (error) {
        console.error(`Error updating dispute ${disputeId} status:`, error);
        throw error;
    }
};

// Note: The original adminService.js had functions like deleteUser, addNewAdmin, etc.
// These are not explicitly defined in the Spring Boot AdminController from previous steps.
// If these are needed, corresponding backend endpoints must be implemented first.
// For example, a deleteUser might look like:
// export const deleteUser = async (userId) => {
//     const token = getToken();
//     try {
//         // Assuming backend endpoint DELETE /api/admin/users/{userId}
//         const response = await del(`${ADMIN_API_URL}/users/${userId}`, token);
//         return response;
//     } catch (error) {
//         console.error(`Error deleting user ${userId}:`, error);
//         throw error;
//     }
// };
