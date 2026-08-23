import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import analysisRoutes from "./routes/analysisRoutes.js";

const app = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "*",
    optionsSuccessStatus: 200,
  })
);

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
    limit: "10kb",
  })
);

// Analysis API
app.use("/api", analysisRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the SIH Intelligent Problem Analyzer API",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

export default app;