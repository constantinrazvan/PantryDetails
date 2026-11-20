import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middlware";
import { UserRole } from "../models/enums/user-role.enum";

const userController = new UserController();
const adminOnly = requireRole(UserRole.ADMIN);

const userRouter = Router();
userRouter.use(authenticate);

userRouter.get("/", adminOnly, userController.list);
userRouter.post("/", adminOnly, userController.create);
userRouter.get("/me", userController.me);
userRouter.patch("/me", userController.updateProfile);
userRouter.patch("/me/email", userController.changeEmail);
userRouter.patch("/me/password", userController.changePassword);
userRouter.patch("/:userId", adminOnly, userController.adminUpdate);
userRouter.delete("/:userId", adminOnly, userController.delete);

export default userRouter;
