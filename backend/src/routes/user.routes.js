import express from "express"
import userController from "../controllers/user.controller.js";
const userRoutes = express.Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.delete("/logout/:id",userController.logout);

export default userRoutes;
