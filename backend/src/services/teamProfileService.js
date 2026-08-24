import TeamProfile from "../models/TeamProfile.js";

export const createOrUpdateTeamProfile = async (
  teamProfileData
) => {
  const {
    teamId,
    name,
    members,
    preferences,
  } = teamProfileData;

  if (!teamId?.trim()) {
    throw new Error("teamId is required.");
  }

  if (!name?.trim()) {
    throw new Error("Team name is required.");
  }

  const profile = await TeamProfile.findOneAndUpdate(
    { teamId: teamId.trim() },
    {
      teamId: teamId.trim(),
      name: name.trim(),
      members: Array.isArray(members) ? members : [],
      preferences: preferences || {},
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return profile;
};

export const getTeamProfile = async (teamId) => {
  if (!teamId?.trim()) {
    throw new Error("teamId is required.");
  }

  const profile = await TeamProfile.findOne({
    teamId: teamId.trim(),
  }).lean();

  return profile;
};