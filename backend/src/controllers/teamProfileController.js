import {
  createOrUpdateTeamProfile,
  getTeamProfile,
} from "../services/teamProfileService.js";

export const saveTeamProfileController = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== "production") {
      const contentLength = req.headers["content-length"];
      console.debug(
        `[teamProfile] ${req.method} ${req.url} body=${typeof req.body} keys=${JSON.stringify(
          Object.keys(req.body || {}),
        )} content-type=${req.headers["content-type"] || "none"} content-length=${
          contentLength ?? "n/a"
        }`,
      );
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        error: "Request body is required.",
      });
    }

    const { teamId, name, members, preferences } = req.body;

    const profile = await createOrUpdateTeamProfile({
      teamId,
      name,
      members,
      preferences,
      accessToken: req.teamAccessToken,
    });

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamProfileController = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const profile = await getTeamProfile(teamId, req.teamAccessToken);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Team profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
