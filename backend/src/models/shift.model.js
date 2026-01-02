import mongoose from "mongoose";

const ShiftSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    date: { type: Date, required: true }, // The specific date of the shift
    type: { type: String, enum: ['Morning', 'Evening', 'Night', 'Off'], required: true },
    location: { type: String }, // Optional: specific ward or desk
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate shifts for same staff on same day (optional but good practice)
ShiftSchema.index({ staffId: 1, date: 1 }, { unique: true });

export const Shift = mongoose.model('Shift', ShiftSchema);
