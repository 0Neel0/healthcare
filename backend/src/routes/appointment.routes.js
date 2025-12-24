import express from "express";
import appointmentController from "../controllers/appointment.controller.js";
import { verifyAdminPasskey } from "../middleware/adminPasskey.middleware.js";

const router = express.Router();

// Public routes
router.post('/create', appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointment);

// Admin routes (protected by passkey)
router.get('/', verifyAdminPasskey, appointmentController.getAppointments);
router.get('/admin/stats', verifyAdminPasskey, appointmentController.getAppointmentStats);
router.patch('/:id/schedule', verifyAdminPasskey, appointmentController.scheduleAppointment);
router.patch('/:id/cancel', verifyAdminPasskey, appointmentController.cancelAppointment);
router.put('/:id', verifyAdminPasskey, appointmentController.updateAppointment);
router.delete('/:id', verifyAdminPasskey, appointmentController.deleteAppointment);

export default router;
