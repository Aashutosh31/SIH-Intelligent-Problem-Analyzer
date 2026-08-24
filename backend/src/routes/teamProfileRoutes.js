import { Router } from "express";

import {
  saveTeamProfileController,
  getTeamProfileController,
} from "../controllers/teamProfileController.js";

const router = Router();

router.post(
  "/team-profile",
  saveTeamProfileController
);

router.get(
  "/team-profile/:teamId",
  getTeamProfileController
);

export default router;