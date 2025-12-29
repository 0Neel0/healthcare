import api from './api';
import paymentService from './paymentService';

export const billingService = {
    // Get bills for a patient or all bills (Admin)
    getAllInvoices: async (params = {}) => {
        if (params.patientId) {
            return await api.get(`/billing/patient/${params.patientId}`);
        }
        return await api.get('/billing');
    },

    // Create a new bill (Admin/Doctor)
    createInvoice: async (billData) => {
        const response = await api.post('/billing/create', billData);
        return response.data;
    },

    // Get single bill
    getInvoiceById: async (id) => {
        const response = await api.get(`/billing/${id}`);
        return response.data;
    },

    // Process payment for a bill
    payBill: async (billId, amount) => {
        try {
            // 1. Create Razorpay Order
            const order = await paymentService.createOrder(amount);

            return {
                amount: order.amount,
                currency: order.currency,
                keyId: order.keyId,
                order_id: order.id
            };
        } catch (error) {
            throw error;
        }
    },

    // Verify billing payment
    verifyBillPayment: async (paymentData) => {
        const response = await api.post('/payment/verify', paymentData);
        return response.data;
    },

    // Update payment status manually (Admin)
    updatePayment: async (id, paymentData) => {
        const response = await api.patch(`/billing/${id}/status`, paymentData);
        return response.data;
    }
};

export default billingService;
