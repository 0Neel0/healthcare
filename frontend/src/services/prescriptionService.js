import api from './api';

export const prescriptionService = {
    // Create a new prescription
    createPrescription: async (prescriptionData) => {
        const response = await api.post('/prescriptions', prescriptionData);
        return response.data;
    },

    // Get prescription by ID
    getPrescription: async (id) => {
        const response = await api.get(`/prescriptions/${id}`);
        return response.data;
    },

    // Get all prescriptions for a patient
    getPatientPrescriptions: async (patientId) => {
        const response = await api.get(`/prescriptions/patient/${patientId}`);
        return response.data;
    },

    // Get all prescriptions by doctor
    getDoctorPrescriptions: async (doctorName) => {
        const response = await api.get(`/prescriptions/doctor/${encodeURIComponent(doctorName)}`);
        return response.data;
    },

    // Update prescription
    updatePrescription: async (id, prescriptionData) => {
        const response = await api.put(`/prescriptions/${id}`, prescriptionData);
        return response.data;
    },

    // Delete prescription
    deletePrescription: async (id) => {
        const response = await api.delete(`/prescriptions/${id}`);
        return response.data;
    }
};

export default prescriptionService;
