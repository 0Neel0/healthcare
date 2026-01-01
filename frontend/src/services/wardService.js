import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export const wardService = {
    // Get all wards
    getWards: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/wards`);
            return response.data;
        } catch (error) {
            console.error('Error fetching wards:', error);
            throw error;
        }
    },

    // Create new ward
    createWard: async (wardData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/wards`, wardData);
            return response.data;
        } catch (error) {
            console.error('Error creating ward:', error);
            throw error;
        }
    },

    // Add bed to ward
    addBedToWard: async (wardId, bedData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/wards/${wardId}/beds`, bedData);
            return response.data;
        } catch (error) {
            console.error('Error adding bed to ward:', error);
            throw error;
        }
    },

    // Admit patient to bed
    admitPatientToBed: async (wardId, bedId, patientId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/wards/${wardId}/beds/${bedId}/admit`,
                { patientId }
            );
            return response.data;
        } catch (error) {
            console.error('Error admitting patient:', error);
            throw error;
        }
    },

    // Discharge patient from bed
    dischargePatientFromBed: async (wardId, bedId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/wards/${wardId}/beds/${bedId}/discharge`
            );
            return response.data;
        } catch (error) {
            console.error('Error discharging patient:', error);
            throw error;
        }
    },

    // Get active admissions for a patient
    getPatientAdmissions: async (patientId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/wards/patient/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching patient admissions:', error);
            throw error;
        }
    },

    generateInterimBill: async (wardId, bedId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/wards/${wardId}/beds/${bedId}/bill`);
            return response.data;
        } catch (error) {
            console.error('Error generating interim bill:', error);
            throw error;
        }
    }
};

export default wardService;
