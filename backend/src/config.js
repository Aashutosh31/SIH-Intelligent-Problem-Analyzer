import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\/+$/, "");
};

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction,
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  frontendUrl: normalizeOrigin(process.env.FRONTEND_URL),
};

if (isProduction) {
  const missing = [];

  if (!config.mongoUri) {
    missing.push("MONGO_URI");
  }

  if (!config.geminiApiKey) {
    missing.push("GEMINI_API_KEY");
  }

  if (!config.frontendUrl) {
    missing.push("FRONTEND_URL");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s) for production: ${missing.join(", ")}.`
    );
  }

  if (config.frontendUrl === "*") {
    throw new Error(
      "FRONTEND_URL must be a single origin in production. Wildcard '*' is not allowed."
    );
  }
}