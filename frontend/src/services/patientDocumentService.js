import api from './api';

export const patientDocumentService = {
    // Upload a document
    uploadDocument: async (file, title, description) => {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        const response = await api.post('/patient-documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get my documents (for patient)
    getMyDocuments: async () => {
        const response = await api.get('/patient-documents/my-documents');
        return response.data;
    },

    // Get documents by patient ID (for doctor/admin)
    getDocumentsByPatientId: async (patientId) => {
        const response = await api.get(`/patient-documents/patient/${patientId}`);
        return response.data;
    },

    // Delete a document
    deleteDocument: async (id) => {
        const response = await api.delete(`/patient-documents/${id}`);
        return response.data;
    }
};
