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

const requireValidToken = (accessToken, storedHash) => {
  if (!tokensMatch(accessToken, storedHash)) {
    const error = new Error("Invalid team access token.");

    error.status = 401;

    throw error;
  }
};

const throwMigrationRequired = () => {
  const error = new Error(
    "This team profile requires migration. It was created before team access control existed and cannot be accessed or updated without a valid session."
  );

  error.status = 401;

  throw error;
};

const findProfileByTeamId = (teamId) =>
  TeamProfile.findOne({ teamId }).select("+accessTokenHash").lean();

export const createOrUpdateTeamProfile = async ({
  teamId,
  name,
  members,
  preferences,
  accessToken,
}) => {
  if (!teamId?.trim()) {
    throw new Error("teamId is required.");
  }

  if (!name?.trim()) {
    throw new Error("Team name is required.");
  }

  const normalizedTeamId = teamId.trim();

  const normalizedMembers = Array.isArray(members)
    ? members.map((member) => ({
        name: member.name?.trim() || "",
        role: member.role?.trim() || "",
        skills: normalizeMemberSkills(member.skills),
      }))
    : [];

  const existingProfile = await findProfileByTeamId(normalizedTeamId);

  let issuedAccessToken = null;

  if (existingProfile) {
    if (existingProfile.accessTokenHash) {
      requireValidToken(accessToken, existingProfile.accessTokenHash);
    } else {
      throwMigrationRequired();
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
      returnDocument: "after",
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

  const profile = await findProfileByTeamId(teamId.trim());

  if (!profile) {
    return null;
  }

  if (!profile.accessTokenHash) {
    throwMigrationRequired();
  }

  requireValidToken(accessToken, profile.accessTokenHash);

  return normalizeTeamProfile(profile);
};
