import express from 'express';
import {
    createWard,
    getWards,
    addBedToWard,
    admitPatientToBed,
    dischargePatientFromBed
} from '../controllers/ward.controller.js';

const router = express.Router();

// Ward Routes
router.post('/', createWard);
router.get('/', getWards);

// Bed Routes
router.post('/:wardId/beds', addBedToWard);
router.post('/:wardId/beds/:bedId/admit', admitPatientToBed);
router.post('/:wardId/beds/:bedId/discharge', dischargePatientFromBed);

export default router;
