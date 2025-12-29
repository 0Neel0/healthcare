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
    razorpayAccountId: {
        type: String // For split payments
    },
    availableSlots: [String],

    // Availability Management
    availability: {
        status: {
            type: String,
            enum: ['active', 'break', 'away', 'offline'],
            default: 'active'
        },
        schedule: [{
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            startTime: String,
            endTime: String,
            isAvailable: { type: Boolean, default: true }
        }],
        breakTimes: [{
            startTime: String,
            endTime: String,
            description: String
        }],
        outOfOfficeDates: [{
            startDate: Date,
            endDate: Date,
            reason: String
        }]
    },

    // Revenue Tracking
    consultationFee: {
        type: Number,
        default: 0
    },
    earnings: [{
        date: { type: Date, default: Date.now },
        amount: Number,
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
        patientName: String
    }],

    createdAt: { type: Date, default: Date.now }
});
export const Doctor = mongoose.model('Doctor', DoctorSchema);