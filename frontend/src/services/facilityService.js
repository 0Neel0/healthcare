import api from './api';

export const facilityService = {
    getAllWards: () => api.get('/wards'),
    createWard: (data) => api.post('/wards', data),
    addBed: (wardId, data) => api.post(`/wards/${wardId}/beds`, data),
    admitPatient: (wardId, bedId, data) => api.post(`/wards/${wardId}/beds/${bedId}/admit`, data),
    dischargePatient: (wardId, bedId) => api.post(`/wards/${wardId}/beds/${bedId}/discharge`),
};
