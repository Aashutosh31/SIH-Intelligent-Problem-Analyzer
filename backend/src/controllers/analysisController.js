import { analyzeProblem } from "../services/analysisService.js";
import { getTeamProfile } from "../services/teamProfileService.js";

export const analyzeProblemController = async (
  req,
  res,
  next
) => {
  try {
    const { problemStatement, teamId } = req.body;

    if (typeof problemStatement !== "string") {
      return res.status(400).json({
        success: false,
        error: "problemStatement must be a string.",
      });
    }

    const normalizedProblem =
      problemStatement.trim();

    if (!normalizedProblem) {
      return res.status(400).json({
        success: false,
        error: "problemStatement is required.",
      });
    }

    if (normalizedProblem.length > 10000) {
      return res.status(400).json({
        success: false,
        error:
          "problemStatement must not exceed 10,000 characters.",
      });
    }

    if (
      teamId !== undefined &&
      teamId !== null &&
      typeof teamId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "teamId must be a string.",
      });
    }

    const normalizedTeamId =
      teamId && typeof teamId === "string"
        ? teamId.trim() || null
        : null;

    let teamProfile = null;

    if (normalizedTeamId) {
      const profile = await getTeamProfile(
        normalizedTeamId,
        req.teamAccessToken,
      );

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Team profile not found.",
        });
      }

      teamProfile = profile;
    }

    const analysis = await analyzeProblem({
      problemStatement: normalizedProblem,
      teamProfile,
    });

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
