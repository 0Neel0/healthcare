import mongoose from "mongoose"

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String
    },
    specialization: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    availableSlots: [String],
    createdAt: { type: Date, default: Date.now }
});
export const Doctor = mongoose.model('Doctor', DoctorSchema);