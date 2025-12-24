import api from './api';

export const labService = {
    getTests: () => api.get('/lab/tests'),
    addTest: (data) => api.post('/lab/tests', data),
    getRequests: (params) => api.get('/lab/requests', { params }),
    createRequest: (data) => api.post('/lab/requests', data),
    updateRequestStatus: (id, data) => api.put(`/lab/requests/${id}`, data),
};
