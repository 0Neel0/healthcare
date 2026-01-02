import api from './api';

export const pharmacyService = {
    // Get pending prescriptions for pharmacy
    getPendingPrescriptions: async () => {
        const response = await api.get('/pharmacy/prescriptions/pending');
        return response.data;
    },

    // Dispense medicines
    dispenseMedicines: async (dispenseData) => {
        // dispenseData: { prescriptionId, items: [{ name, quantity }] }
        const response = await api.post('/pharmacy/dispense', dispenseData);
        return response.data;
    },

    // Inventory Management
    getInventory: async () => {
        const response = await api.get('/inventory?type=Medicine');
        return response.data;
    },

    addMedicine: async (medData) => {
        // Enforce type='Medicine'
        const payload = { ...medData, type: 'Medicine' };
        const response = await api.post('/inventory', payload);
        return response.data;
    }
};

export default pharmacyService;
