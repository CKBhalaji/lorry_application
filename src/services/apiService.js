export const API_BASE_URL = 'http://localhost:8080/api'; // Default Spring Boot port

const request = async (method, endpoint, body = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method.toUpperCase(),
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            // Attempt to parse error response, otherwise throw a generic error
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: `HTTP error! status: ${response.status}` };
            }
            throw errorData;
        }

        // If response is ok and has content, parse it. Otherwise, return null for no content (e.g., 204).
        if (response.status === 204) {
            return null;
        }
        // For login, the response might not be JSON if it's just a token string directly
        // However, our backend sends JwtResponse which is JSON.
        return await response.json();

    } catch (error) {
        console.error(`API ${method} request to ${endpoint} failed:`, error);
        throw error; // Re-throw the error to be caught by the calling service/component
    }
};

export const get = (endpoint, token = null) => request('GET', endpoint, null, token);
export const post = (endpoint, body, token = null) => request('POST', endpoint, body, token);
export const put = (endpoint, body, token = null) => request('PUT', endpoint, body, token);
export const del = (endpoint, token = null) => request('DELETE', endpoint, null, token); // 'delete' is a reserved keyword

// Example of a file upload utility, if needed later
// export const postWithFile = async (endpoint, formData, token = null) => {
//     const headers = {};
//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }
//     try {
//         const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//             method: 'POST',
//             headers: headers,
//             body: formData,
//         });
//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
//             throw errorData;
//         }
//         if (response.status === 204) return null;
//         return await response.json();
//     } catch (error) {
//         console.error(`API POST file to ${endpoint} failed:`, error);
//         throw error;
//     }
// };

export default request;
