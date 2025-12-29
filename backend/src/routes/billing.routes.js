import express from 'express';
import billingController from '../controllers/billing.controller.js';

const router = express.Router();

// Create a bill
router.post('/create', billingController.createBill);

// Get bills for a patient
router.get('/patient/:patientId', billingController.getPatientBills);

// Get all bills (Admin)
router.get('/', billingController.getAllBills);

// Get single bill
router.get('/:id', billingController.getBillById);

// Update status
router.patch('/:id/status', billingController.updateBillStatus);

export default router;
