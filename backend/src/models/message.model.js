import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String, // For text messages
    },
    type: {
        type: String,
        enum: ['text', 'image', 'pdf'],
        default: 'text'
    },
    fileUrl: {
        type: String, // Path to file if image/pdf
    },
    fileName: {
        type: String, // Original filename
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
