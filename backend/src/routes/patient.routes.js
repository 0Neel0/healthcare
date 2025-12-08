import express from "express";
import patientController from "../controllers/patient.controller.js";
import auth from "../middleware/auth.middleware.js";

const patientRoutes = express.Router();

patientRoutes.post("/", auth, patientController.createPatient);
patientRoutes.get("/", auth, patientController.getPatients);
patientRoutes.get("/:id", auth, patientController.getPatient);
patientRoutes.put("/:id", auth, patientController.updatePatient);
patientRoutes.delete("/:id", auth, patientController.deletePatient);

export default patientRoutes;
