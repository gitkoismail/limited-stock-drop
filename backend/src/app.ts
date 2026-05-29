import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { productRoutes } from "./modules/products/product.routes";
import { reservationRoutes } from "./modules/reservations/reservation.routes";
import { checkoutRoutes } from "./modules/checkout/checkout.routes";
import { metricsRoutes } from "./modules/metrics/metrics.routes";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  pinoHttp({
    transport:
      env.nodeEnv === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          }
        : undefined,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/products", productRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(errorHandler);