import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import { authenticate } from "../middleware/auth.middleware";

const statsController = new StatsController();
const statsRouter = Router();

statsRouter.use(authenticate);

statsRouter.get("/", statsController.overview);

export default statsRouter;
