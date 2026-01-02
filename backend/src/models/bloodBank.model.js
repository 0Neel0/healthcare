import mongoose from "mongoose";

// Schema for Blood Donors
const BloodDonorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    contact: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    lastDonationDate: { type: Date },
    medicalHistory: { type: String }, // Any diseases or conditions
    createdAt: { type: Date, default: Date.now }
});

// Schema for Blood Inventory (Stock)
const BloodInventorySchema = new mongoose.Schema({
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    component: { type: String, enum: ['Whole Blood', 'Plasma', 'Platelets', 'RBC'], default: 'Whole Blood' },
    quantity: { type: Number, required: true, default: 0 }, // Number of bags
    expiryDate: { type: Date }, // For latest batch or tracked differently (Simplified for MVP: aggregate stock, but maybe separate bags is better. Let's stick to aggregate for MVP or simple batch tracking)
    // Actually, distinct bags are safer. Let's make this 'BloodBag' instead? 
    // For MVP, simple aggregate stock by group usually suffices for high level, but expiration is critical.
    // Let's implement individual bags/units for safety.
    bagNumber: { type: String, unique: true },
    status: { type: String, enum: ['Available', 'Reserved', 'Expired', 'Used'], default: 'Available' },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodDonor' },
    collectionDate: { type: Date, default: Date.now }
});

export const BloodDonor = mongoose.model('BloodDonor', BloodDonorSchema);
export const BloodInventory = mongoose.model('BloodInventory', BloodInventorySchema);
