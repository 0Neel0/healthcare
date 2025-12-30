import express from 'express';
import { upload } from '../middleware/upload.js';
import { verifyToken, isDoctorOrAdmin } from '../middleware/auth.middleware.js';
import {
    uploadDocument,
    getMyDocuments,
    getDocumentsByPatientId,
    deleteDocument,
    updateDocumentStatus,
    askQuestion
} from '../controllers/patientDocument.controller.js';

const router = express.Router();

// Routes
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);
router.get('/my-documents', verifyToken, getMyDocuments);
router.get('/patient/:patientId', verifyToken, isDoctorOrAdmin, getDocumentsByPatientId);
router.delete('/:id', verifyToken, deleteDocument);
router.post('/:id/ask', verifyToken, askQuestion);
// Callback route for AI Service (No auth for internal demo, add API key in prod)
router.patch('/:id/status', updateDocumentStatus);

export default router;
