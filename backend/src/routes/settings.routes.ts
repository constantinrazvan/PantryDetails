import { Router } from "express";
import { SmtpSettingsController } from "../controllers/smtp-settings.controller";
import { DemoDataController } from "../controllers/demo-data.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middlware";
import { UserRole } from "../models/enums/user-role.enum";

const smtpController = new SmtpSettingsController();
const demoDataController = new DemoDataController();
const settingsRouter = Router();

settingsRouter.use(authenticate, requireRole(UserRole.ADMIN));

settingsRouter.get("/smtp", smtpController.get);
settingsRouter.put("/smtp", smtpController.update);
settingsRouter.post("/smtp/test", smtpController.test);
settingsRouter.get("/demo-data", demoDataController.status);
settingsRouter.post("/demo-data", demoDataController.import);
settingsRouter.delete("/demo-data", demoDataController.delete);

export default settingsRouter;
