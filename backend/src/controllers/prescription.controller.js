import { Prescription } from '../models/prescription.model.js';
import { Patient } from '../models/patient.model.js';

export const prescriptionController = {
    // Create new prescription
    createPrescription: async (req, res) => {
        try {
            const prescriptionData = req.body;
            const prescription = new Prescription(prescriptionData);
            await prescription.save();

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                data: prescription
            });
        } catch (error) {
            console.error('Error creating prescription:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create prescription',
                error: error.message
            });
        }
    },

    // Get prescription by ID
    getPrescription: async (req, res) => {
        try {
            const { id } = req.params;
            const prescription = await Prescription.findById(id)
                .populate('patientId', 'name email phone birthDate')
                .populate('appointmentId');

            if (!prescription) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
            }

            res.json({
                success: true,
                data: prescription
            });
        } catch (error) {
            console.error('Error fetching prescription:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescription',
                error: error.message
            });
        }
    },

    // Get all prescriptions for a patient
    getPatientPrescriptions: async (req, res) => {
        try {
            const { patientId } = req.params;
            const prescriptions = await Prescription.find({ patientId })
                .sort({ prescriptionDate: -1 })
                .populate('appointmentId');

            res.json({
                success: true,
                data: prescriptions
            });
        } catch (error) {
            console.error('Error fetching patient prescriptions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescriptions',
                error: error.message
            });
        }
    },

    // Get all prescriptions by doctor
    getDoctorPrescriptions: async (req, res) => {
        try {
            const { doctorName } = req.params;
            const prescriptions = await Prescription.find({ doctorName })
                .sort({ prescriptionDate: -1 })
                .populate('patientId', 'name email phone')
                .populate('appointmentId');

            res.json({
                success: true,
                data: prescriptions
            });
        } catch (error) {
            console.error('Error fetching doctor prescriptions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prescriptions',
                error: error.message
            });
        }
    },

    // Update prescription
    updatePrescription: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            updateData.updatedAt = Date.now();

            const prescription = await Prescription.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!prescription) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
            }

            res.json({
                success: true,
                message: 'Prescription updated successfully',
                data: prescription
            });
        } catch (error) {
            console.error('Error updating prescription:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update prescription',
                error: error.message
            });
        }
    },

    // Delete prescription
    deletePrescription: async (req, res) => {
        try {
            const { id } = req.params;
            const prescription = await Prescription.findByIdAndDelete(id);

            if (!prescription) {
                return res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
            }

            res.json({
                success: true,
                message: 'Prescription deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting prescription:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete prescription',
                error: error.message
            });
        }
    }
};
