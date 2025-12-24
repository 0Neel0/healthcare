import api from './api';

export const reportService = {
    getDashboardStats: () => api.get('/reports/dashboard'),
    getFinancial: () => api.get('/reports/financial'),
    getDoctorPerformance: () => api.get('/reports/doctors'),
};
