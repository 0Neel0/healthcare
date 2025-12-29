import api from './api';

export const paymentService = {
    // Create Razorpay split payment order
    createSplitOrder: async (appointmentId, amount) => {
        const response = await api.post('/payment/create-order', {
            appointmentId,
            amount
        });
        return response.data;
    },

    // Verify Razorpay payment
    verifyPayment: async (paymentData) => {
        const response = await api.post('/payment/verify', paymentData);
        return response.data;
    }
};

export default paymentService;
