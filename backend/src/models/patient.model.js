import mongoose from "mongoose";


const PatientSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: true },
    password: { type: String, required: true }, // Added for Auth
    occupation: { type: String },

    // Emergency Contact
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },

    // Medical Information
    primaryPhysician: { type: String, required: true },
    allergies: { type: String },
    currentMedication: { type: String },
    familyMedicalHistory: { type: String },
    pastMedicalHistory: { type: String },

    // Insurance Information
    insuranceProvider: { type: String, required: true },
    insurancePolicyNumber: { type: String, required: true },

    // Identification
    identificationType: { type: String },
    identificationNumber: { type: String },
    identificationDocumentId: { type: String },
    identificationDocumentUrl: { type: String },

    // Consent
    treatmentConsent: { type: Boolean, default: false },
    disclosureConsent: { type: Boolean, default: false },
    privacyConsent: { type: Boolean, default: false },

    // Legacy field for compatibility
    medicalHistory: [String],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Patient = mongoose.model('Patient', PatientSchema);