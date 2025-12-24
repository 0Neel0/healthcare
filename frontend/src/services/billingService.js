import api from './api';

export const billingService = {
    getAllInvoices: (params) => api.get('/billing', { params }),
    getInvoiceById: (id) => api.get(`/billing/${id}`),
    createInvoice: (data) => api.post('/billing', data),
    updatePayment: (id, data) => api.put(`/billing/${id}/payment`, data),
};
