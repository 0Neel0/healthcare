import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add passkey from localStorage if available
        const passkey = localStorage.getItem('adminPasskey');
        if (passkey) {
            config.headers['x-admin-passkey'] = passkey;
        }

        // Add JWT token from localStorage if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log detailed error information for debugging
        if (error.response) {
            console.error('[API Error]', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method,
                message: error.response.data?.message || error.message,
                data: error.response.data
            });
        } else {
            console.error('[API Network Error]', error.message);
        }

        if (error.response?.status === 401) {
            // Clear invalid passkey
            localStorage.removeItem('adminPasskey');
        }
        return Promise.reject(error);
    }
);

export default api;
