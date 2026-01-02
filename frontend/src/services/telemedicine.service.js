import api from './api';

export const getMessages = async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
};

export const sendMessage = async (formData) => {
    const response = await api.post('/messages', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const telemedicineService = {
    getMessages,
    sendMessage,
};
