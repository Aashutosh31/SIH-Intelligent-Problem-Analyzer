import {
  normalizeSkills,
  normalizeSkill,
} from "../utils/skillNormalizer.js";

const clampProficiency = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 5;
  }

  return Math.max(
    1,
    Math.min(10, Math.round(numericValue))
  );
};

const buildTeamSkillMap = (members) => {
  const skillMap = new Map();

  for (const member of members || []) {
    for (const rawSkill of member.skills || []) {
      const skillName =
        typeof rawSkill === "string"
          ? rawSkill
          : rawSkill?.name;

      const normalizedSkillName =
        normalizeSkill(skillName);

      if (!normalizedSkillName) {
        continue;
      }

      const proficiency = clampProficiency(
        typeof rawSkill === "string"
          ? 5
          : rawSkill?.proficiency
      );

      const key = normalizedSkillName.toLowerCase();

      const existing = skillMap.get(key);

      if (
        !existing ||
        proficiency > existing.proficiency
      ) {
        skillMap.set(key, {
          name: normalizedSkillName,
          proficiency,
        });
      }
    }
  }

  return skillMap;
};

const calculateCoverage = (
  requiredSkill,
  teamSkill
) => {
  if (!teamSkill) {
    return 0;
  }

  const proficiency = clampProficiency(
    teamSkill.proficiency
  );

  const normalizedWeight =
    Number(requiredSkill.weight) || 0;

  return (
    (proficiency / 10) *
    normalizedWeight
  );
};

export const calculateTeamFit = ({
  requiredSkills,
  teamProfile,
}) => {
  if (!Array.isArray(requiredSkills)) {
    throw new Error(
      "requiredSkills must be an array."
    );
  }

  if (!teamProfile) {
    throw new Error(
      "teamProfile is required."
    );
  }

  const teamSkillMap = buildTeamSkillMap(
    teamProfile.members || []
  );

  const normalizedRequirements = requiredSkills
    .map((requirement) => ({
      ...requirement,

      skill: normalizeSkill(
        requirement.skill
      ),

      weight:
        Number(requirement.weight) || 0,
    }))
    .filter(
      (requirement) =>
        requirement.skill &&
        requirement.weight > 0
    );

  let totalWeight = 0;
  let coveredWeight = 0;

  const matchedSkills = [];
  const partialMatches = [];
  const missingSkills = [];
  const criticalGaps = [];

  for (const requirement of normalizedRequirements) {
    totalWeight += requirement.weight;

    const key =
      requirement.skill.toLowerCase();

    const teamSkill = teamSkillMap.get(key);

    const coverage = calculateCoverage(
      requirement,
      teamSkill
    );

    coveredWeight += coverage;

    if (!teamSkill) {
      const missingSkill = {
        ...requirement,
        coverage: 0,
      };

      missingSkills.push(missingSkill);

      if (
        requirement.importance ===
          "Must Have" ||
        requirement.weight >= 8
      ) {
        criticalGaps.push(missingSkill);
      }

      continue;
    }

    const proficiency = clampProficiency(
      teamSkill.proficiency
    );

    const match = {
      ...requirement,
      proficiency,
      coverage: Math.round(coverage * 100) / 100,
    };

    if (proficiency >= 8) {
      matchedSkills.push(match);
    } else {
      partialMatches.push(match);

      if (
        requirement.importance ===
          "Must Have" &&
        proficiency < 5
      ) {
        criticalGaps.push(match);
      }
    }
  }

  const score =
    totalWeight === 0
      ? 0
      : Math.round(
          (coveredWeight / totalWeight) *
            100
        );

  return {
    score,

    totalWeight,

    coveredWeight:
      Math.round(coveredWeight * 100) / 100,

    teamSkills: Array.from(
      teamSkillMap.values()
    ),

    matchedSkills,

    partialMatches,

    missingSkills,

    criticalGaps,

    summary:
      criticalGaps.length === 0
        ? "The team covers the critical technical requirements of this problem."
        : `The team has ${criticalGaps.length} critical skill gap${
            criticalGaps.length === 1
              ? ""
              : "s"
          } that should be addressed before committing to the problem.`,
  };
};