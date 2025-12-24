import express from 'express';
import {
    addMedicalRecord,
    getPatientRecords,
    getRecordById
} from '../controllers/medicalRecord.controller.js';

const router = express.Router();

router.post('/', addMedicalRecord);
router.get('/patient/:patientId', getPatientRecords);
router.get('/:id', getRecordById);

export default router;
