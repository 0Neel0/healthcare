import api from './api';

export const operationsService = {
    // --- Queue ---
    getPublicQueue: async () => {
        const response = await api.get('/queue/display');
        // This endpoint is public potentially, but our api instance uses auth header.
        // If we want truly public, we might need a separate axios instance or backend should allow no-auth.
        // For MVP, assuming Admin/Staff/Kiosk is logged in.
        return response.data;
    },
    callNextPatient: async (doctorName) => {
        const response = await api.post('/queue/next', { doctorName });
        return response.data;
    },

    // --- Rosters ---
    getRoster: async (start, end, dept) => {
        const response = await api.get('/shifts', { params: { start, end, dept } });
        return response.data;
    },
    assignShift: async (shiftData) => {
        const response = await api.post('/shifts', shiftData);
        return response.data;
    }
};
