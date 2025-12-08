import express from "express";
const routes = express.Router();
import patientRoutes from "./patient.routes.js" 
import userRoutes from "./user.routes.js" 
import doctorRoutes from "./doctor.routes.js" 
import appointmentRoutes from "./appointment.routes.js" 



routes.use("/user", userRoutes);
routes.use("/doctors", doctorRoutes);
routes.use("/patients", patientRoutes);
routes.use("/appointments", appointmentRoutes);


export default routes;
