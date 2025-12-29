import mongoose from "mongoose";


const PatientSchema = new mongoose.Schema({
    // Basic Information - Essential fields (required for registration)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // Added for Auth

    // Optional Basic Information (can be added during profile completion)
    birthDate: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String },
    occupation: { type: String },

    // Emergency Contact (optional - can be added during profile completion)
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },

    // Medical Information (optional)
    primaryPhysician: { type: String },
    allergies: { type: String },
    currentMedication: { type: String },
    familyMedicalHistory: { type: String },
    pastMedicalHistory: { type: String },

    // Insurance Information (optional)
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },

    // Identification (optional)
    identificationType: { type: String },
    identificationNumber: { type: String },
    identificationDocumentId: { type: String },
    identificationDocumentUrl: { type: String },

    // Consent
    treatmentConsent: { type: Boolean, default: false },
    disclosureConsent: { type: Boolean, default: false },
    privacyConsent: { type: Boolean, default: false },

    // Profile Customization
    description: { type: String }, // User bio
    profilePicture: { type: String }, // Path/URL to image

    // Legacy field for compatibility
    medicalHistory: [String],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Patient = mongoose.model('Patient', PatientSchema);