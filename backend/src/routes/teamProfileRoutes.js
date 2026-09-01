import { Router } from "express";

import {
  saveTeamProfileController,
  getTeamProfileController,
} from "../controllers/teamProfileController.js";

import { parseBearerToken } from "../middleware/teamAuth.js";

const router = Router();

router.post(
  "/team-profile",
  parseBearerToken,
  saveTeamProfileController
);

router.get(
  "/team-profile/:teamId",
  parseBearerToken,
  getTeamProfileController
);

export default router;
