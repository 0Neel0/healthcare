import api from './api';

/**
 * Service for handling appointment-related API operations.
 */
export const appointmentService = {
    // ==========================================
    // General Appointment Methods
    // ==========================================

    /**
     * Create a new appointment.
     * @param {Object} appointmentData - The data for creating an appointment.
     * @returns {Promise<Object>} The created appointment response.
     */
    createAppointment: async (appointmentData) => {
        const response = await api.post('/appointments/create', appointmentData);
        return response.data;
    },

    /**
     * Get an appointment by its ID.
     * @param {string} id - The ID of the appointment.
     * @returns {Promise<Object>} The appointment details.
     */
    getAppointment: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    /**
     * Get appointments for a specific patient.
     * @param {string} patientId - The ID of the patient.
     * @returns {Promise<Array>} List of patient's appointments.
     */
    getPatientAppointments: async (patientId) => {
        const response = await api.get(`/appointments/patient/${patientId}`);
        return response.data;
    },

    /**
     * Get appointments for a specific doctor.
     * @param {string} doctorName - The name of the doctor.
     * @param {string|null} [date=null] - Optional date filter (YYYY-MM-DD).
     * @returns {Promise<Array>} List of doctor's appointments.
     */
    getDoctorAppointments: async (doctorName, date = null) => {
        const params = date ? { date } : {};
        const response = await api.get(`/appointments/doctor/${encodeURIComponent(doctorName)}`, { params });
        return response.data;
    },

    // ==========================================
    // Status & Billing Methods
    // ==========================================

    /**
     * Update appointment status.
     * @param {string} id - The ID of the appointment.
     * @param {string} status - The new status (e.g., 'scheduled', 'cancelled').
     * @returns {Promise<Object>} The updated appointment.
     */
    updateStatus: async (id, status) => {
        const response = await api.patch(`/appointments/${id}/status`, { status });
        return response.data;
    },

    /**
     * Update appointment billing status.
     * @param {string} id - The ID of the appointment.
     * @param {string} billingStatus - The new billing status (e.g., 'paid', 'unpaid').
     * @returns {Promise<Object>} The updated appointment.
     */
    updateBillingStatus: async (id, billingStatus) => {
        const response = await api.patch(`/appointments/${id}/billing`, { billingStatus });
        return response.data;
    },

    // ==========================================
    // Doctor Specific Methods
    // ==========================================

    /**
     * Doctor confirms an appointment and sets the consultation fee.
     * @param {string} id - The ID of the appointment.
     * @param {number} consultationFee - The fee for the consultation.
     * @returns {Promise<Object>} The confirmed appointment.
     */
    doctorConfirmAppointment: async (id, consultationFee) => {
        const response = await api.patch(`/appointments/${id}/confirm`, { consultationFee });
        return response.data;
    },

    /**
     * Reschedule an appointment (Doctor).
     * @param {string} id - The ID of the appointment.
     * @param {string} schedule - The new ISO schedule string.
     * @returns {Promise<Object>} The updated appointment.
     */
    rescheduleAppointment: async (id, schedule) => {
        const response = await api.patch(`/appointments/${id}/reschedule`, { schedule });
        return response.data;
    },

    // ==========================================
    // Admin Only Methods
    // ==========================================

    /**
     * Get all appointments (Admin only).
     * @param {number} [page=1] - Page number.
     * @param {number} [limit=10] - Number of items per page.
     * @returns {Promise<Object>} Paginated list of appointments.
     */
    getAppointments: async (page = 1, limit = 10) => {
        const response = await api.get('/appointments', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Get appointment statistics (Admin only).
     * @returns {Promise<Object>} Appointment statistics.
     */
    getAppointmentStats: async () => {
        const response = await api.get('/appointments/admin/stats');
        return response.data;
    },

    /**
     * Schedule an appointment (Admin only).
     * @param {string} id - The ID of the appointment.
     * @param {Object} scheduleData - Scheduling details (date, time, doctor).
     * @returns {Promise<Object>} The scheduled appointment.
     */
    scheduleAppointment: async (id, scheduleData) => {
        const response = await api.patch(`/appointments/${id}/schedule`, scheduleData);
        return response.data;
    },

    /**
     * Cancel an appointment (Admin only).
     * @param {string} id - The ID of the appointment.
     * @param {string} cancellationReason - The reason for cancellation.
     * @returns {Promise<Object>} The cancelled appointment.
     */
    cancelAppointment: async (id, cancellationReason) => {
        const response = await api.patch(`/appointments/${id}/cancel`, {
            cancellationReason
        });
        return response.data;
    },

    /**
     * Update an appointment details (Admin only).
     * @param {string} id - The ID of the appointment.
     * @param {Object} appointmentData - New appointment data.
     * @returns {Promise<Object>} The updated appointment.
     */
    updateAppointment: async (id, appointmentData) => {
        const response = await api.put(`/appointments/${id}`, appointmentData);
        return response.data;
    },

    /**
     * Delete an appointment (Admin only).
     * @param {string} id - The ID of the appointment.
     * @returns {Promise<Object>} Deletion confirmation.
     */
    deleteAppointment: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },

    /**
     * Admin requests doctor confirmation (Admin only).
     * @param {string} id - The ID of the appointment.
     * @returns {Promise<Object>} The updated appointment.
     */
    adminRequestConfirmation: async (id) => {
        const response = await api.patch(`/appointments/${id}/request-confirmation`);
        return response.data;
    }
};

export default appointmentService;
