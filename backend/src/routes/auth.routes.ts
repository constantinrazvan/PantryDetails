import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authController = new AuthController();
const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);

export default authRouter;
