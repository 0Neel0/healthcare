import express from "express";
import appointmentController from "../controllers/appointment.controller.js";
import { verifyAdminPasskey } from "../middleware/adminPasskey.middleware.js";

const router = express.Router();

// Public routes
router.post('/create', appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointment);

// Patient and Doctor routes
router.get('/patient/:patientId', appointmentController.getPatientAppointments);
router.get('/doctor/:doctorName', appointmentController.getDoctorAppointments);

// Admin routes (protected by passkey)
router.get('/', verifyAdminPasskey, appointmentController.getAppointments);
router.get('/admin/stats', verifyAdminPasskey, appointmentController.getAppointmentStats);
router.patch('/:id/schedule', verifyAdminPasskey, appointmentController.scheduleAppointment);
router.patch('/:id/cancel', verifyAdminPasskey, appointmentController.cancelAppointment);
router.patch('/:id/status', appointmentController.updateStatus); // For doctor workflow
router.patch('/:id/billing', appointmentController.updateBillingStatus); // For doctor billing request
router.patch('/:id/request-confirmation', verifyAdminPasskey, appointmentController.adminRequestConfirmation); // Admin -> Doctor
router.patch('/:id/confirm', appointmentController.doctorConfirmAppointment); // Doctor -> Payment Pending
router.put('/:id', verifyAdminPasskey, appointmentController.updateAppointment);
router.delete('/:id', verifyAdminPasskey, appointmentController.deleteAppointment);

export default router;
