import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Appointment } from '../models/appointment.model.js';
import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import { Billing } from '../models/billing.model.js';
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Split Payment Order (50/50)
 */
const createSplitOrder = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            console.error(`Appointment not found: ${appointmentId}`);
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const apptDrName = appointment.primaryPhysician.trim();
        console.log(`Processing payment for Appt: ${appointmentId}, Doctor: "${apptDrName}"`);

        // Case-Insensitive Lookup Function
        const findDoctor = async (name) => {
            // Regex to match exact name case-insensitively
            return await Doctor.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        };

        // 1. Try Exact Name (Case Insensitive)
        let doctor = await findDoctor(apptDrName);

        // 2. Try removing "Dr." prefix
        if (!doctor) {
            const cleanName = apptDrName.replace(/^Dr\.?\s*/i, '');
            console.log(`  Trying clean name: "${cleanName}"`);
            doctor = await findDoctor(cleanName);
        }

        // 3. Try adding "Dr." prefix
        if (!doctor) {
            const drName = `Dr. ${apptDrName.replace(/^Dr\.?\s*/i, '')}`; // Ensure only one prefix
            console.log(`  Trying Dr. prefix: "${drName}"`);
            doctor = await findDoctor(drName);
        }

        if (!doctor) {
            console.log(`  Doctor not found in Doctors collection. Checking Users collection for fallback...`);

            // 4. FALLBACK: Check if a User exists with this name and role='doctor'
            // Use same regex search logic
            const user = await User.findOne({
                name: { $regex: new RegExp(`^${apptDrName.replace(/^Dr\.?\s*/i, '')}$`, 'i') },
                role: 'doctor'
            });

            if (user) {
                console.log(`  Found matching User: "${user.name}". Creating missing Doctor record...`);

                // Create Doctor record on the fly
                doctor = await Doctor.create({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || 'N/A',
                    specialization: 'General', // Default
                    consultationFee: appointment.consultationFee || 500,
                    availability: { status: 'active' }
                });
                console.log(`  Doctor record created successfully: ${doctor._id}`);
            }
        }

        if (!doctor) {
            console.error(`  FAILED: No doctor record matches "${apptDrName}"`);
            return res.status(404).json({ message: `Doctor record not found for "${apptDrName}". Verify spelling or case in Doctor Profile.` });
        }

        // 50/50 Split Logic
        const totalAmount = appointment.consultationFee;
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: 'Consultation fee not set' });
        }

        const doctorShare = Math.floor(totalAmount * 100 * 0.5); // 50% in paise

        const options = {
            amount: totalAmount * 100, // Total amount in paise
            currency: "INR",
            receipt: `receipt_${appointmentId}`,
            payment_capture: 1,
            // Split Logic if Doctor has Linked Account
            transfers: doctor.razorpayAccountId ? [
                {
                    account: doctor.razorpayAccountId,
                    amount: doctorShare,
                    currency: "INR",
                    notes: {
                        branch: "Main Branch",
                        name: doctor.name
                    },
                    linked_account_notes: [
                        "branch"
                    ],
                    on_hold: 0
                }
            ] : undefined
        };

        const order = await razorpay.orders.create(options);

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
            doctorName: doctor.name,
            consultationFee: totalAmount
        });

    } catch (err) {
        console.error('[Payment Error]', err);
        next(err);
    }
};

/**
 * Verify Payment
 */
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Update Appointment Status
            const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
                status: 'scheduled',
                paymentStatus: 'paid',
                transactionId: razorpay_payment_id,
                updatedAt: new Date()
            }, { new: true });

            // Create a Billing Record for this transaction so it shows in history
            const billingRecord = new Billing({
                patientId: appointment.patient,
                appointmentId: appointment._id,
                services: [{
                    name: 'Consultation Fee',
                    cost: appointment.consultationFee || 0,
                    quantity: 1
                }],
                totalAmount: appointment.consultationFee || 0,
                paymentStatus: 'Paid',
                paymentMethod: 'Online',
                transactionId: razorpay_payment_id,
                notes: 'Paid via Online Appointment Booking'
            });
            await billingRecord.save();

            // Notify Doctor and Admin
            if (req.io) {
                req.io.to(`doctor_${appointment.primaryPhysician}`).emit('appointment_paid', appointment);
                req.io.to('admin_room').emit('appointment_paid', appointment);
            }

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        next(err);
    }
};

export const paymentController = {
    createSplitOrder,
    verifyPayment
};
