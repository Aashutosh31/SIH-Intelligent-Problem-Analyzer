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

/*
 * Builds an API-safe team object from a (lean) Mongo document.
 *
 * The raw document may contain auth material such as accessTokenHash
 * (selected internally for verification). It must NEVER reach responses,
 * so we construct an explicit allow-list shape here.
 */
const toSafeProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    _id: profile._id,
    teamId: profile.teamId,
    name: profile.name,
    members: Array.isArray(profile.members)
      ? profile.members.map((member) => ({
          _id: member._id,
          name: member.name,
          role: member.role,
          skills: normalizeMemberSkills(member.skills),
        }))
      : [],
    preferences: profile.preferences || {},
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
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

const normalizeMembersInput = (members) => {
  if (members === undefined || members === null) {
    return [];
  }

  if (!Array.isArray(members)) {
    const error = new Error("members must be an array.");

    error.status = 400;

    throw error;
  }

  return members.map((member) => {
    if (!member || typeof member !== "object") {
      const error = new Error(
        "Each team member must be an object with a name, role, and skills."
      );

      error.status = 400;

      throw error;
    }

    const name =
      typeof member.name === "string" ? member.name.trim() : "";

    const role =
      typeof member.role === "string" ? member.role.trim() : "";

    if (!name) {
      const error = new Error(
        "Each team member must have a non-empty name."
      );

      error.status = 400;

      throw error;
    }

    if (!role) {
      const error = new Error(
        "Each team member must have a non-empty role."
      );

      error.status = 400;

      throw error;
    }

    return {
      name,
      role,
      skills: normalizeMemberSkills(member.skills),
    };
  });
};

const normalizePreferencesInput = (preferences) => {
  if (!preferences || typeof preferences !== "object") {
    return {};
  }

  const normalized = {};

  if (typeof preferences.softwareOnly === "boolean") {
    normalized.softwareOnly = preferences.softwareOnly;
  }

  for (const key of [
    "hardwareComfort",
    "aiMlComfort",
    "willingnessToLearn",
  ]) {
    const value = Number(preferences[key]);

    if (Number.isFinite(value)) {
      normalized[key] = Math.max(0, Math.min(10, Math.round(value)));
    }
  }

  return normalized;
};

export const createOrUpdateTeamProfile = async ({
  teamId,
  name,
  members,
  preferences,
  accessToken,
}) => {
  if (!teamId?.trim()) {
    const error = new Error("teamId is required.");

    error.status = 400;

    throw error;
  }

  if (!name?.trim()) {
    const error = new Error("Team name is required.");

    error.status = 400;

    throw error;
  }

  if (typeof teamId !== "string" || typeof name !== "string") {
    const error = new Error("teamId and name must be strings.");

    error.status = 400;

    throw error;
  }

  const normalizedTeamId = teamId.trim();

  const normalizedMembers = normalizeMembersInput(members);
  const normalizedPreferences = normalizePreferencesInput(preferences);

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
    preferences: normalizedPreferences,
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
    profile: toSafeProfile(profile),
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

  return toSafeProfile(profile);
};