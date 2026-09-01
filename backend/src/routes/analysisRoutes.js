import { Router } from "express";
import rateLimit from "express-rate-limit";
import { analyzeProblemController } from "../controllers/analysisController.js";
import { parseBearerToken } from "../middleware/teamAuth.js";

const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many analysis requests, please try again later.",
  },
});

const router = Router();

router.post(
  "/analyze",
  analysisLimiter,
  parseBearerToken,
  analyzeProblemController
);

export default router;
