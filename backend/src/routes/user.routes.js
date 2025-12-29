import express from "express"
import userController from "../controllers/user.controller.js";
const userRoutes = express.Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.post("/google", userController.googleLogin);
userRoutes.delete("/logout/:id", userController.logout);
userRoutes.get("/doctors", userController.getDoctors);
userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);

export default userRoutes;
