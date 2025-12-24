import express from "express";
const routes = express.Router();
import patientRoutes from "./patient.routes.js"
import userRoutes from "./user.routes.js"
import doctorRoutes from "./doctor.routes.js"
import appointmentRoutes from "./appointment.routes.js"
import inventoryRoutes from "./inventory.routes.js"
import billingRoutes from "./billing.routes.js"
import medicalRecordRoutes from "./medicalRecord.routes.js"
import labRoutes from "./lab.routes.js"
import wardRoutes from "./ward.routes.js"
import staffRoutes from "./staff.routes.js"
import reportRoutes from "./report.routes.js"

routes.use("/user", userRoutes);
routes.use("/doctors", doctorRoutes);
routes.use("/patients", patientRoutes);
routes.use("/appointments", appointmentRoutes);
routes.use("/inventory", inventoryRoutes);
routes.use("/billing", billingRoutes);
routes.use("/emr", medicalRecordRoutes);
routes.use("/lab", labRoutes);
routes.use("/wards", wardRoutes);
routes.use("/staff", staffRoutes);
routes.use("/reports", reportRoutes);

export default routes;
