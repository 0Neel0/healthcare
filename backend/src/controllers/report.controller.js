export const getDashboardStats = async (req, res) => {
    // This would aggregate data from Appointment, Billing, Patient, etc.
    // For now, returning mock structure to be filled
    res.status(200).json({
        patients: { total: 120, newToday: 5 },
        revenue: { total: 50000, today: 1200 },
        appointments: { total: 45, pending: 10 },
        occupancy: { wards: "80%", icu: "50%" }
    });
};

import { Appointment } from '../models/appointment.model.js';
import { Billing } from '../models/billing.model.js';

export const getRevenueStats = async (req, res) => {
    try {
        // 1. Aggregate Paid Appointments (50/50 Split)
        const appointmentStats = await Appointment.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: "$primaryPhysician",
                    totalCollected: { $sum: "$consultationFee" },
                    appointmentCount: { $sum: 1 },
                    lastPaymentDate: { $max: "$updatedAt" }
                }
            },
            { $sort: { totalCollected: -1 } }
        ]);

        // Calculate Doctor/Admin Shares from Appointments
        const doctorStats = appointmentStats.map(doc => ({
            doctorName: doc._id,
            totalCollected: doc.totalCollected,
            doctorShare: doc.totalCollected * 0.5,
            adminShare: doc.totalCollected * 0.5,
            appointmentCount: doc.appointmentCount,
            lastPaymentDate: doc.lastPaymentDate
        }));

        const totalAppointmentRevenue = doctorStats.reduce((acc, curr) => acc + curr.totalCollected, 0);

        // 2. Aggregate Paid Bills (Bed Charges/Hospital Charges) - 100% to Admin
        const billingStats = await Billing.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalBillingRevenue = billingStats.length > 0 ? billingStats[0].totalCollected : 0;

        // 3. Final Totals
        const totalRevenue = totalAppointmentRevenue + totalBillingRevenue;
        const totalAdminShare = (totalAppointmentRevenue * 0.5) + totalBillingRevenue;
        const totalDoctorShare = totalAppointmentRevenue * 0.5;

        res.json({
            summary: {
                totalRevenue,
                totalAdminShare,
                totalDoctorShare,
                breakdown: {
                    appointments: totalAppointmentRevenue,
                    hospitalServices: totalBillingRevenue
                }
            },
            doctorStats
        });

    } catch (err) {
        console.error('Revenue Stats Error:', err);
        res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
};

export const getFinancialReport = async (req, res) => {
    // Logic to aggregate Billing collection by date range
    res.status(200).json({ message: "Financial Report data" });
};

export const getDoctorPerformance = async (req, res) => {
    // Logic to count appointments per doctor
    res.status(200).json({ message: "Doctor Performance data" });
};
