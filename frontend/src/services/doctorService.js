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
};

export default doctorService;
