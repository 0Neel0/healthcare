import api from './api';

export const criticalCareService = {
    // --- Blood Bank ---
    getDonors: async () => {
        const response = await api.get('/blood/donors');
        return response.data;
    },
    addDonor: async (donorData) => {
        const response = await api.post('/blood/donors', donorData);
        return response.data;
    },
    getBloodInventory: async () => {
        const response = await api.get('/blood/inventory');
        return response.data; // { stock: [], stats: [] }
    },
    addBloodBag: async (bagData) => {
        const response = await api.post('/blood/inventory', bagData);
        return response.data;
    },
    updateBagStatus: async (id, status) => {
        const response = await api.patch(`/blood/inventory/${id}/status`, { status });
        return response.data;
    },

    // --- Operation Theater ---
    getOTRooms: async () => {
        const response = await api.get('/ot/rooms');
        return response.data;
    },
    addOTRoom: async (roomData) => {
        const response = await api.post('/ot/rooms', roomData);
        return response.data;
    },
    updateOTRoomStatus: async (id, status) => {
        const response = await api.patch(`/ot/rooms/${id}/status`, { status });
        return response.data;
    },
    getOTSchedule: async (date) => {
        const response = await api.get('/ot/schedule', { params: { date } });
        return response.data;
    },
    bookOT: async (bookingData) => {
        const response = await api.post('/ot/schedule', bookingData);
        return response.data;
    }
};
