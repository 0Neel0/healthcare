import mongoose from "mongoose";

const LabRequestSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },

    status: {
        type: String,
        enum: ['Requested', 'Sample Collected', 'Processing', 'Completed', 'Cancelled'],
        default: 'Requested'
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },

    // Results
    resultValue: String,
    resultNotes: String,
    reportUrl: String,

    sampleCollectedAt: Date,
    completedAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const LabRequest = mongoose.model('LabRequest', LabRequestSchema);
