import Message from '../models/message.model.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, type } = req.body;
        const senderId = req.user.id; // From auth middleware

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        if (!content && !req.file) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        let fileUrl = null;
        let fileName = null;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
            fileName = req.file.originalname;
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            type: type || (req.file ? (req.file.mimetype === 'application/pdf' ? 'pdf' : 'image') : 'text'),
            fileUrl,
            fileName
        });

        await newMessage.save();

        // Emit real-time updates
        if (req.io) {
            // Emit to receiver's private room
            req.io.to(`user_${receiverId}`).emit('receive_message', newMessage);

            // Emit to sender's private room (for syncing other devices/tabs)
            req.io.to(`user_${senderId}`).emit('receive_message', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error sending message', error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};
