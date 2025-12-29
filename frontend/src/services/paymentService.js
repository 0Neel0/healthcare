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
