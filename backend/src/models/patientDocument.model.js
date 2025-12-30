import mongoose from "mongoose";

const PatientDocumentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true }, // 'application/pdf', 'image/jpeg', etc.
    description: String,

    // AI Processing Fields
    summary: { type: String, default: "" },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    processingError: { type: String, default: null },
    extractedText: { type: String, default: "" }, // Full text for Q&A features

    // Chat History Persistence
    chatHistory: [{
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Could be patient or doctor helping them

    uploadDate: { type: Date, default: Date.now },
});

export const PatientDocument = mongoose.model('PatientDocument', PatientDocumentSchema);
