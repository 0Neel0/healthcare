import api from './api';

export const paymentService = {
    // Create generic Razorpay order
    createOrder: async (amount, appointmentId) => {
        const response = await api.post('/payment/create-order', {
            amount,
            appointmentId
        });
        return response.data;
    },

    // Create Razorpay split payment order (LEGACY/SPECIFIC)
    createSplitOrder: async (appointmentId, amount) => {
        const response = await api.post('/payment/create-order-split', {
            appointmentId,
            amount
        });
        return response.data;
    },

    // Verify Razorpay payment
    verifyPayment: async (paymentData) => {
        const response = await api.post('/payment/verify', paymentData);
        return response.data;
    },

    // Load Razorpay Script
    loadRazorpayScript: () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }
};

export default paymentService;
