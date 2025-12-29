import express from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';

const router = express.Router();

// Create new prescription
router.post('/', prescriptionController.createPrescription);

// Get prescription by ID
router.get('/:id', prescriptionController.getPrescription);

// Get all prescriptions for a patient
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);

// Get all prescriptions by doctor
router.get('/doctor/:doctorName', prescriptionController.getDoctorPrescriptions);

// Update prescription
router.put('/:id', prescriptionController.updatePrescription);

// Delete prescription
router.delete('/:id', prescriptionController.deletePrescription);

export default router;
