import mongoose from "mongoose";

const PatientDocumentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true }, // 'application/pdf', 'image/jpeg', etc.
    description: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Could be patient or doctor helping them

    uploadDate: { type: Date, default: Date.now },
});

export const PatientDocument = mongoose.model('PatientDocument', PatientDocumentSchema);
