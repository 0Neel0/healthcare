import express from "express";
import { profileUpload } from "../middleware/upload.js";
import patientController from "../controllers/patient.controller.js";

const router = express.Router();

// Public routes (no auth required for initial sign-up)
router.post('/', patientController.createPatient);
router.post('/login', patientController.loginPatient);
router.get('/email', patientController.getPatientByEmail);

// Patient management routes
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);

// ...

router.put('/:id', (req, res, next) => {
    profileUpload.single('profilePicture')(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            return res.status(400).json({ message: 'Upload failed', error: err.message });
        }
        next();
    });
}, patientController.updatePatient);
router.put('/:id/register', patientController.registerPatient);
router.delete('/:id', patientController.deletePatient);

export default router;
