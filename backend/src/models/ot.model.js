import mongoose from "mongoose";

// OT Room Schema
const OTRoomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    name: { type: String }, // e.g., "Cardiac OT 1"
    type: { type: String, enum: ['General', 'Cardiac', 'Neuro', 'Orthopedic', 'Emergency'], default: 'General' },
    status: { type: String, enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'], default: 'Available' },
    resources: [String], // List of equipment available
    createdAt: { type: Date, default: Date.now }
});

// OT Schedule/Booking Schema
const OTScheduleSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'OTRoom', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Lead Surgeon
    anesthesiologist: { type: String }, // Name or ID
    procedureName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const OTRoom = mongoose.model('OTRoom', OTRoomSchema);
export const OTSchedule = mongoose.model('OTSchedule', OTScheduleSchema);
