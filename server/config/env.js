import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Robust .env loading with sensible fallbacks
const NODE = process.env.NODE_ENV || "development";
const candidates = [
  `.env.${NODE}.local`,
  `.env.${NODE}`,
  `.env.local`,
  `.env`,
];

for (const file of candidates) {
  const full = path.resolve(process.cwd(), file);
  if (fs.existsSync(full)) {
    config({ path: full });
    break;
  }
}

export const {
    PORT,
    NODE_ENV,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_PASS,
    SMTP_SERVICE,
    SMTP_EMAIL,
    FRONTEND_URL,
    ORIGIN,
    CLOUD_NAME,
    CLOUD_API_KEY,
    CLOUD_SECRET_KEY,
    REDIS_URL,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    ACTIVATION_SECRET,
    ACCESS_TOKEN,
    REFRESH_TOKEN
} = process.env;