import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import analysisRoutes from "./routes/analysisRoutes.js";
import teamProfileRoutes from "./routes/teamProfileRoutes.js";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Production runs behind a single trusted proxy hop (Render).
// Configuring trust proxy BEFORE rate limiting lets express-rate-limit
// derive each client's real IP from X-Forwarded-For instead of collapsing
// every user into one shared bucket.
if (config.isProduction) {
  app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet());

if (config.isProduction) {
  // Strict single-origin CORS in production. config.js guarantees
  // FRONTEND_URL is present (and not "*") before the app starts.
  //
  // Only exactly the configured frontend origin is allowed. Requests from any
  // other origin get no Access-Control-Allow-Origin header, so the browser
  // blocks cross-origin reads. This is defense-in-depth on top of the
  // browser's own CORS enforcement.
  app.use(
    cors({
      origin(optionsOrigin, callback) {
        if (optionsOrigin === config.frontendUrl) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      optionsSuccessStatus: 200,
    })
  );
} else {
  // Permissive localhost development.
  app.use(cors({ origin: "*" }));
}

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api", apiLimiter);

app.use(
  express.json({
    limit: "64kb",
  })
);

// Analysis API
app.use("/api", analysisRoutes);
app.use("/api", teamProfileRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the SIH Intelligent Problem Analyzer API",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  const isDbConnected =
    mongoose.connection.readyState === 1;

  res.status(200).json({
    status: isDbConnected ? "healthy" : "degraded",
    environment: config.env,
    database: isDbConnected ? "connected" : "disconnected",
  });
});

// JSON 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

// Body-parser errors (malformed JSON, oversized body) -> clean JSON responses.
// Only catch errors that originate from body-parser itself (identified by
// err.type).  Application-level 400 errors (validation failures) must NOT be
// caught here — they carry their own message and should reach the main error
// handler.
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: "Request body is too large.",
    });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON body.",
    });
  }

  return next(err);
});

// Centralized error handler
app.use(errorHandler);

export default app;