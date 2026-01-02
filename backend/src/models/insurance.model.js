import mongoose from "mongoose";

const InsuranceClaimSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerName: { type: String, required: true }, // e.g. "Blue Cross", "Medicare"
    policyNumber: { type: String, required: true },
    diagnosis: { type: String, required: true },

    treatmentDate: { type: Date, default: Date.now },
    claimAmount: { type: Number, required: true },
    approvedAmount: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['Pending', 'In Review', 'Approved', 'Rejected', 'Partially Approved'],
        default: 'Pending'
    },

    adminNotes: { type: String },
    documents: [{ type: String }], // Array of URLs to scanned docs

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const InsuranceClaim = mongoose.model('InsuranceClaim', InsuranceClaimSchema);
