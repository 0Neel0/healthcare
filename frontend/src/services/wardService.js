import api from './api';

const wardService = {
    // Get active admissions for a patient
    getPatientAdmissions: async (patientId) => {
        const response = await api.get(`/wards/patient/${patientId}`);
        return response.data;
    },

    // Generate interim bill for current stay
    generateInterimBill: async (wardId, bedId) => {
        const response = await api.post(`/wards/${wardId}/beds/${bedId}/bill`);
        return response.data;
    },

    // Shared methods (optional, but useful if we migrate away from facilityService)
    getAllWards: () => api.get('/wards'),
};

export default wardService;
