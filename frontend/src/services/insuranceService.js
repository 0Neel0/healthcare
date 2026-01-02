import api from './api';

export const insuranceService = {
    getAllClaims: async (status, patientId) => {
        const params = {};
        if (status) params.status = status;
        if (patientId) params.patientId = patientId;

        const response = await api.get('/insurance/claims', { params });
        return response.data;
    },

    submitClaim: async (claimData) => {
        const response = await api.post('/insurance/claims', claimData);
        return response.data;
    },

    updateClaimStatus: async (id, data) => {
        const response = await api.put(`/insurance/claims/${id}/status`, data);
        return response.data;
    }
};

export default insuranceService;
