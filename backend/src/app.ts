import "reflect-metadata";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./routes/index.routes";
import { swaggerDocument } from "./config/swagger";

const app = express();

app.use(cors(corsOptions()));
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", apiRouter);

export default app;
