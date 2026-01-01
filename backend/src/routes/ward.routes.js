import express from 'express';
import {
    createWard,
    getWards,
    addBedToWard,
    admitPatientToBed,
    dischargePatientFromBed,
    getAdmittedWardsForPatient,
    generateInterimBill
} from '../controllers/ward.controller.js';

const router = express.Router();

// Ward Routes
router.post('/', createWard);
router.get('/', getWards);
router.get('/patient/:patientId', getAdmittedWardsForPatient);

// Bed Routes
router.post('/:wardId/beds', addBedToWard);
router.post('/:wardId/beds/:bedId/admit', admitPatientToBed);
router.post('/:wardId/beds/:bedId/discharge', dischargePatientFromBed);
router.post('/:wardId/beds/:bedId/bill', generateInterimBill);

export default router;
