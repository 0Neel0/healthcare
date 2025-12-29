import api from './api';

export const patientService = {
    // Create a new patient
    createPatient: async (patientData) => {
        const response = await api.post('/patients', patientData);
        return response.data;
    },

    // Login
    login: async (credentials) => {
        const response = await api.post('/patients/login', credentials);
        return response.data;
    },

    // Get patient by email
    getPatientByEmail: async (email) => {
        const response = await api.get(`/patients/email`, {
            params: { email }
        });
        return response.data;
    },

    // Get patient by ID
    getPatient: async (id) => {
        const response = await api.get(`/patients/${id}`);
        return response.data;
    },

    // Update patient
    updatePatient: async (id, patientData) => {
        const isFormData = patientData instanceof FormData;
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await api.put(`/patients/${id}`, patientData, config);
        return response.data;
    },

    registerPatient: async (id, registrationData) => {
        const response = await api.put(`/patients/${id}/register`, registrationData);
        return response.data;
    },

    // Get all patients
    getAllPatients: async () => {
        const response = await api.get('/patients');
        return response.data;
    },
};

export default patientService;
