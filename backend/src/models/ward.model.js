import mongoose from "mongoose";

const BedSchema = new mongoose.Schema({
    number: { type: String, required: true },
    type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU', 'Ventilator'], default: 'General' },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'], default: 'Available' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // If occupied
    admissionDate: { type: Date },
    costPerDay: { type: Number, required: true }
});

const WardSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "North Wing 1A", "ICU"
    type: { type: String, required: true }, // e.g., "General", "Maternity", "Critical Care"
    floor: { type: String },
    beds: [BedSchema],
    capacity: { type: Number, required: true },

    // Auto-calculated fields (handled in controller usually, but good to store cache if needed)
    occupiedBeds: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Ward = mongoose.model('Ward', WardSchema);
