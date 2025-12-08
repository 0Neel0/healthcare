import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: {
         type: Date,
         required: true 
    },
    status: { 
        type: String, 
        enum: ['scheduled','completed','cancelled'], 
        default: 'scheduled' 
    },
    notes: {
        type:String
    },
    createdAt: {
         type: Date, default: Date.now 
        }
});
export const Appointment = mongoose.model('Appointment', AppointmentSchema);