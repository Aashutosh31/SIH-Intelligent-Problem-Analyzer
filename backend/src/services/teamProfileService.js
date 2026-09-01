import TeamProfile from "../models/TeamProfile.js";
import crypto from "node:crypto";

const hashAccessToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = () => crypto.randomBytes(32).toString("hex");

const tokensMatch = (token, storedHash) => {
  if (
    typeof token !== "string" ||
    !token ||
    typeof storedHash !== "string" ||
    !storedHash
  ) {
    return false;
  }

  const candidateHash = hashAccessToken(token);

  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
};

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

      const name = typeof skill.name === "string" ? skill.name.trim() : "";

      if (!name) {
        return null;
      }

      const parsedProficiency = Number(skill.proficiency);

      const proficiency = Number.isFinite(parsedProficiency)
        ? Math.max(1, Math.min(10, Math.round(parsedProficiency)))
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
    typeof profile.toObject === "function" ? profile.toObject() : profile;

  return {
    ...plainProfile,

    members: Array.isArray(plainProfile.members)
      ? plainProfile.members.map((member) => ({
          ...member,
          skills: normalizeMemberSkills(member.skills),
        }))
      : [],
  };
};

export const createOrUpdateTeamProfile = async (teamProfileData) => {
  const { teamId, name, members, preferences, accessToken } = teamProfileData;

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
        skills: normalizeMemberSkills(member.skills),
      }))
    : [];

  const normalizedTeamId = teamId.trim();

  const existingProfile = await TeamProfile.findOne({
    teamId: normalizedTeamId,
  })
    .select("+accessTokenHash")
    .lean();

  let issuedAccessToken = null;

  if (existingProfile) {
    if (!tokensMatch(accessToken, existingProfile.accessTokenHash)) {
      const error = new Error("Invalid team access token.");

      error.status = 403;

      throw error;
    }
  } else {
    issuedAccessToken = generateAccessToken();
  }

  const update = {
    teamId: normalizedTeamId,
    name: name.trim(),
    members: normalizedMembers,
    preferences: preferences || {},
  };

  if (issuedAccessToken) {
    update.accessTokenHash = hashAccessToken(issuedAccessToken);
  }

  const profile = await TeamProfile.findOneAndUpdate(
    { teamId: normalizedTeamId },
    update,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return {
    profile: normalizeTeamProfile(profile),
    accessToken: issuedAccessToken,
  };
};

export const getTeamProfile = async (teamId, accessToken) => {
  if (!teamId?.trim()) {
    throw new Error("teamId is required.");
  }

  const profile = await TeamProfile.findOne({
    teamId: teamId.trim(),
  })
    .select("+accessTokenHash")
    .lean();

  if (!profile) {
    return null;
  }

  if (!tokensMatch(accessToken, profile.accessTokenHash)) {
    const error = new Error("Invalid team access token.");

    error.status = 403;

    throw error;
  }

  return normalizeTeamProfile(profile);
};
