import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to auth user if they have login access

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },

    role: {
        type: String,
        enum: ['Nurse', 'Technician', 'Pharmacist', 'Receptionist', 'Admin', 'HR', 'Cleaner', 'Security'],
        required: true
    },
    department: { type: String, required: true },

    // HR Details
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
    joinDate: { type: Date, required: true },
    salary: { type: Number },

    // Shift Management (Simplified)
    shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Rotating'], default: 'Morning' },
    isActive: { type: Boolean, default: true },

    address: String,
    emergencyContact: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Staff = mongoose.model('Staff', StaffSchema);
