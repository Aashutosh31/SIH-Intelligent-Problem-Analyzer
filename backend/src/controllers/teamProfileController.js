import {
  createOrUpdateTeamProfile,
  getTeamProfile,
} from "../services/teamProfileService.js";

export const saveTeamProfileController = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await createOrUpdateTeamProfile(req.body);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamProfileController = async (
  req,
  res,
  next
) => {
  try {
    const { teamId } = req.params;

    const profile = await getTeamProfile(teamId);

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