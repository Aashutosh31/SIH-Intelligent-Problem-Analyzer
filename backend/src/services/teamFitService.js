import { normalizeSkills, normalizeSkill } from "../utils/skillNormalizer.js";

const calculateWeightedScore = (requiredSkills, teamSkills) => {
  if (!requiredSkills.length) {
    return {
      score: 0,
      totalWeight: 0,
      matchedWeight: 0,
    };
  }

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const requirement of requiredSkills) {
    const weight = Number(requirement.weight) || 0;

    totalWeight += weight;

    const requiredSkill = normalizeSkill(
      requirement.skill
    ).toLowerCase();

    const hasSkill = teamSkills.some(
      (teamSkill) =>
        teamSkill.toLowerCase() === requiredSkill
    );

    if (hasSkill) {
      matchedWeight += weight;
    }
  }

  const score =
    totalWeight === 0
      ? 0
      : Math.round(
          (matchedWeight / totalWeight) * 100
        );

  return {
    score,
    totalWeight,
    matchedWeight,
  };
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

  const teamSkills = normalizeSkills(
    (teamProfile.members || []).flatMap(
      (member) => member.skills || []
    )
  );

  const normalizedRequirements = requiredSkills
    .map((requirement) => ({
      ...requirement,
      skill: normalizeSkill(requirement.skill),
      weight: Number(requirement.weight) || 0,
    }))
    .filter(
      (requirement) =>
        requirement.skill && requirement.weight > 0
    );

  const {
    score,
    totalWeight,
    matchedWeight,
  } = calculateWeightedScore(
    normalizedRequirements,
    teamSkills
  );

  const matchedSkills = [];
  const missingSkills = [];
  const criticalGaps = [];

  for (const requirement of normalizedRequirements) {
    const hasSkill = teamSkills.some(
      (teamSkill) =>
        teamSkill.toLowerCase() ===
        requirement.skill.toLowerCase()
    );

    if (hasSkill) {
      matchedSkills.push({
        skill: requirement.skill,
        importance: requirement.importance,
        weight: requirement.weight,
        reason: requirement.reason,
      });

      continue;
    }

    const missingSkill = {
      skill: requirement.skill,
      importance: requirement.importance,
      weight: requirement.weight,
      reason: requirement.reason,
    };

    missingSkills.push(missingSkill);

    if (
      requirement.importance === "Must Have" ||
      requirement.weight >= 8
    ) {
      criticalGaps.push(missingSkill);
    }
  }

  return {
    score,

    matchedWeight,
    totalWeight,

    teamSkills,

    matchedSkills,
    missingSkills,
    criticalGaps,

    summary:
      criticalGaps.length === 0
        ? "The team covers the critical technical requirements of this problem."
        : `The team has ${criticalGaps.length} critical skill gap${
            criticalGaps.length === 1 ? "" : "s"
          } that should be addressed before committing to the problem.`,
  };
};