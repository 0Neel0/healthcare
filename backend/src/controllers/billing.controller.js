import { Billing } from "../models/billing.model.js";

export const createInvoice = async (req, res) => {
    try {
        const newInvoice = new Billing(req.body);
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { patientId } = req.query;
        let query = {};
        if (patientId) query.patientId = patientId;

        const invoices = await Billing.find(query)
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Billing.findById(id).populate('patientId', 'name email phone');
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentMethod, transactionId } = req.body;

        const updatedInvoice = await Billing.findByIdAndUpdate(
            id,
            {
                paymentStatus,
                paymentMethod,
                transactionId,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedInvoice) return res.status(404).json({ message: "Invoice not found" });
        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
