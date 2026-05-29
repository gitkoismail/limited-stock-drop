import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing in .env file");
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};