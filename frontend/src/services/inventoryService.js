import api from './api';

export const inventoryService = {
    getAllItems: () => api.get('/inventory'),
    getLowStockItems: () => api.get('/inventory/low-stock'),
    addItem: (data) => api.post('/inventory', data),
    updateItem: (id, data) => api.put(`/inventory/${id}`, data),
    deleteItem: (id) => api.delete(`/inventory/${id}`),
};
