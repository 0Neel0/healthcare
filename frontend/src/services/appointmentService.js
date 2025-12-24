import api from './api';

export const appointmentService = {
    // Create a new appointment
    createAppointment: async (appointmentData) => {
        const response = await api.post('/appointments/create', appointmentData);
        return response.data;
    },

    // Get appointment by ID
    getAppointment: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Get all appointments (admin only)
    getAppointments: async (page = 1, limit = 10) => {
        const response = await api.get('/appointments', {
            params: { page, limit }
        });
        return response.data;
    },

    // Get appointment statistics (admin only)
    getAppointmentStats: async () => {
        const response = await api.get('/appointments/admin/stats');
        return response.data;
    },

    // Schedule an appointment (admin only)
    scheduleAppointment: async (id, scheduleData) => {
        const response = await api.patch(`/appointments/${id}/schedule`, scheduleData);
        return response.data;
    },

    // Cancel an appointment (admin only)
    cancelAppointment: async (id, cancellationReason) => {
        const response = await api.patch(`/appointments/${id}/cancel`, {
            cancellationReason
        });
        return response.data;
    },

    // Update an appointment (admin only)
    updateAppointment: async (id, appointmentData) => {
        const response = await api.put(`/appointments/${id}`, appointmentData);
        return response.data;
    },

    // Delete an appointment (admin only)
    deleteAppointment: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },
};

export default appointmentService;
