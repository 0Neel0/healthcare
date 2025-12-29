import express from 'express';
import { upload } from '../middleware/upload.js';
import { verifyToken, isDoctorOrAdmin } from '../middleware/auth.middleware.js';
import {
    uploadDocument,
    getMyDocuments,
    getDocumentsByPatientId,
    deleteDocument
} from '../controllers/patientDocument.controller.js';

const router = express.Router();

// Routes
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);
router.get('/my-documents', verifyToken, getMyDocuments);
router.get('/patient/:patientId', verifyToken, isDoctorOrAdmin, getDocumentsByPatientId);
router.delete('/:id', verifyToken, deleteDocument);

export default router;
