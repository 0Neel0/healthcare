import express from "express";
import patientController from "../controllers/patient.controller.js";

const router = express.Router();

// Public routes (no auth required for initial sign-up)
router.post('/', patientController.createPatient);
router.post('/login', patientController.loginPatient);
router.get('/email', patientController.getPatientByEmail);

// Patient management routes
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);
import { upload } from "../middleware/upload.js";

// ...

router.put('/:id', upload.single('profilePicture'), patientController.updatePatient);
router.put('/:id/register', patientController.registerPatient);
router.delete('/:id', patientController.deletePatient);

export default router;
