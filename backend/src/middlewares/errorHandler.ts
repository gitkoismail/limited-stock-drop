import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};