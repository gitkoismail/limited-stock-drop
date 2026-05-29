import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<RequestPart, ZodType<unknown>>>;

export function validateRequest(schemas: ValidationSchemas): RequestHandler {
  return (req, res, next) => {
    for (const key of Object.keys(schemas) as RequestPart[]) {
      const schema = schemas[key];

      if (!schema) continue;

      const result = schema.safeParse(req[key]);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.flatten(),
        });
        return;
      }
    }

    next();
  };
}