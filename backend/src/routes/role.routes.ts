import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middlware";
import { UserRole } from "../models/enums/user-role.enum";

const roleController = new RoleController();
const roleRouter = Router();

roleRouter.use(authenticate, requireRole(UserRole.ADMIN));

roleRouter.get("/", roleController.list);
roleRouter.get("/icons", roleController.icons);
roleRouter.post("/", roleController.create);
roleRouter.patch("/:roleId", roleController.update);
roleRouter.delete("/:roleId", roleController.delete);

export default roleRouter;
