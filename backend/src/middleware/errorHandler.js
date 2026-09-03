import { config } from "../config.js";

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  if (status < 500) {
    // 4xx responses are intentionally user-facing in this API.
    return res.status(status).json({
      success: false,
      error: err.message || "Request could not be processed.",
    });
  }

  // Unexpected 5xx errors must never leak internal details in production.
  if (config.isProduction) {
    console.error("Internal server error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }

  console.error(err.stack);

  return res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};