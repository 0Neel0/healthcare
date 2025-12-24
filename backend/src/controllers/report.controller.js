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

export const getFinancialReport = async (req, res) => {
    // Logic to aggregate Billing collection by date range
    res.status(200).json({ message: "Financial Report data" });
};

export const getDoctorPerformance = async (req, res) => {
    // Logic to count appointments per doctor
    res.status(200).json({ message: "Doctor Performance data" });
};
