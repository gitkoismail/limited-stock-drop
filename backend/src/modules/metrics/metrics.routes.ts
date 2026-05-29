import { Router } from "express";
import { getMetricsController } from "./metrics.controller";

export const metricsRoutes = Router();

metricsRoutes.get("/", getMetricsController);