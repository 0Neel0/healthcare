import express from "express";
import appointmentController from "../controllers/appointment.controller.js";
import auth from "../middleware/auth.middleware.js";

const appointmentRoutes = express.Router();

appointmentRoutes.post("/", auth, appointmentController.createAppointment);
appointmentRoutes.get("/", auth, appointmentController.getAppointments);
appointmentRoutes.get("/:id", auth, appointmentController.getAppointment);
appointmentRoutes.put("/:id", auth, appointmentController.updateAppointment);
appointmentRoutes.delete("/:id", auth, appointmentController.deleteAppointment);

export default appointmentRoutes;
