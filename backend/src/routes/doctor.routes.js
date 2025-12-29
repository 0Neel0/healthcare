import express from "express";
import doctorController from "../controllers/doctor.controller.js";
import auth from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/adminOnly.middleware.js";

const doctorRoutes = express.Router();

doctorRoutes.post("/", auth, adminOnly, doctorController.createDoctor);
doctorRoutes.get("/", auth, doctorController.getDoctors);
doctorRoutes.get("/:id", auth, doctorController.getDoctor);
doctorRoutes.put("/:id", auth, adminOnly, doctorController.updateDoctor);
doctorRoutes.delete("/:id", auth, adminOnly, doctorController.deleteDoctor);

// Availability and stats routes
doctorRoutes.put("/:name/availability", auth, doctorController.updateAvailability);
doctorRoutes.get("/:name/stats", auth, doctorController.getStats);

export default doctorRoutes;
