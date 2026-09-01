import {
  createOrUpdateTeamProfile,
  getTeamProfile,
} from "../services/teamProfileService.js";

export const saveTeamProfileController = async (req, res, next) => {
  try {
    const profile = await createOrUpdateTeamProfile({
      teamId: req.body.teamId,
      name: req.body.name,
      members: req.body.members,
      preferences: req.body.preferences,
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
