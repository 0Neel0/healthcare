import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/google`;

const googleService = {
    // Get the Google Auth URL
    getAuthUrl: async () => {
        const response = await axios.get(`${API_URL}/auth`);
        return response.data;
    },

    // Send the auth code to backend
    connectGoogle: async (code, doctorId) => {
        const response = await axios.post(`${API_URL}/connect`, { code, doctorId });
        return response.data;
    },

    // Disconnect
    disconnectGoogle: async (doctorId) => {
        const response = await axios.post(`${API_URL}/disconnect`, { doctorId });
        return response.data;
    },

    // Get Events
    getGoogleEvents: async (doctorId) => {
        const response = await axios.get(`${API_URL}/events`, { params: { doctorId } });
        return response.data;
    }
};

export default googleService;
