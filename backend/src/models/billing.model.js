import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    services: [{
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partially Paid', 'Cancelled'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Insurance', 'Online'], default: 'Cash' },
    transactionId: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Billing = mongoose.model('Billing', BillingSchema);
