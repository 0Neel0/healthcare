import api from './api';

export const emrService = {
    addRecord: (data) => api.post('/emr', data),
    getPatientRecords: (patientId) => api.get(`/emr/patient/${patientId}`),
    getRecordById: (id) => api.get(`/emr/${id}`),
};
