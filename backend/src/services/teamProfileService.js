import TeamProfile from "../models/TeamProfile.js";

const normalizeMemberSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        return {
          name: skill.trim(),
          proficiency: 5,
        };
      }

      if (!skill || typeof skill !== "object") {
        return null;
      }

      const name =
        typeof skill.name === "string"
          ? skill.name.trim()
          : "";

      if (!name) {
        return null;
      }

      const parsedProficiency = Number(
        skill.proficiency
      );

      const proficiency = Number.isFinite(
        parsedProficiency
      )
        ? Math.max(
            1,
            Math.min(10, Math.round(parsedProficiency))
          )
        : 5;

      return {
        name,
        proficiency,
      };
    })
    .filter(Boolean);
};

const normalizeTeamProfile = (profile) => {
  if (!profile) {
    return null;
  }

  const plainProfile =
    typeof profile.toObject === "function"
      ? profile.toObject()
      : profile;

  return {
    ...plainProfile,

    members: Array.isArray(plainProfile.members)
      ? plainProfile.members.map((member) => ({
          ...member,
          skills: normalizeMemberSkills(
            member.skills
          ),
        }))
      : [],
  };
};

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

  const normalizedMembers = Array.isArray(members)
    ? members.map((member) => ({
        name: member.name?.trim() || "",
        role: member.role?.trim() || "",
        skills: normalizeMemberSkills(
          member.skills
        ),
      }))
    : [];

  const profile =
    await TeamProfile.findOneAndUpdate(
      { teamId: teamId.trim() },
      {
        teamId: teamId.trim(),
        name: name.trim(),
        members: normalizedMembers,
        preferences: preferences || {},
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

  return normalizeTeamProfile(profile);
};

export const getTeamProfile = async (teamId) => {
  if (!teamId?.trim()) {
    throw new Error("teamId is required.");
  }

  const profile = await TeamProfile.findOne({
    teamId: teamId.trim(),
  }).lean();

  return normalizeTeamProfile(profile);
};