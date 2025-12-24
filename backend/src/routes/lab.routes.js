import express from 'express';
import {
    addLabTest,
    getLabTests,
    createLabRequest,
    getLabRequests,
    updateLabRequestStatus
} from '../controllers/lab.controller.js';

const router = express.Router();

// Catalog Routes
router.post('/tests', addLabTest);
router.get('/tests', getLabTests);

// Request Routes
router.post('/requests', createLabRequest);
router.get('/requests', getLabRequests);
router.put('/requests/:id', updateLabRequestStatus);

export default router;
