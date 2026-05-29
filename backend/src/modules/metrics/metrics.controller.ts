import type { Request, Response, NextFunction } from "express";
import { getMetrics } from "./metrics.service";

export async function getMetricsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const metrics = await getMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}