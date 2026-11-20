import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import folderRouter from "./folder.routes";
import roleRouter from "./role.routes";
import settingsRouter from "./settings.routes";
import statsRouter from "./stats.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/folders", folderRouter);
apiRouter.use("/roles", roleRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/stats", statsRouter);

export default apiRouter;
