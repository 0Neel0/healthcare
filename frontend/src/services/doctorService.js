import api from './api';

export const doctorService = {
    // Get all doctors
    getDoctors: async () => {
        const response = await api.get('/doctors');
        return response.data;
    },

    // Get doctor by ID
    getDoctor: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    // Update doctor availability
    updateAvailability: async (doctorName, availabilityData) => {
        const response = await api.put(`/doctors/${encodeURIComponent(doctorName)}/availability`, availabilityData);
        return response.data;
    },

    // Get doctor statistics
    getStats: async (doctorName, period = 'week') => {
        const response = await api.get(`/doctors/${encodeURIComponent(doctorName)}/stats`, {
            params: { period }
        });
        return response.data;
    }
};

export default doctorService;
