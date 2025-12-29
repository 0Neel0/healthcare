import api from './api';

export const chatService = {
    // Send a message (text or file)
    sendMessage: async (receiverId, content, file = null) => {
        const formData = new FormData();
        formData.append('receiverId', receiverId);
        if (content) formData.append('content', content);
        if (file) formData.append('file', file);

        const response = await api.post('/messages/send', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get chat history with a specific user
    getMessages: async (otherUserId) => {
        const response = await api.get(`/messages/${otherUserId}`);
        return response.data;
    }
};

export default chatService;
