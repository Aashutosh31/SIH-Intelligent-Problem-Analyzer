import { Router } from "express";
import { analyzeProblemController } from "../controllers/analysisController.js";

const router = Router();

router.post("/analyze", analyzeProblemController);

export default router;