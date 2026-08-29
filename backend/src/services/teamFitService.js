import { normalizeSkill } from "../utils/skillNormalizer.js";

const clampProficiency = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 5;
  }

  return Math.max(
    1,
    Math.min(10, Math.round(numericValue)),
  );
};

const normalizeMemberId = (member) => {
  if (member?._id) {
    return String(member._id);
  }

  if (member?.id) {
    return String(member.id);
  }

  return null;
};

const normalizeMemberName = (member) => {
  if (
    typeof member?.name === "string" &&
    member.name.trim()
  ) {
    return member.name.trim();
  }

  return "Unnamed Member";
};

const buildTeamSkillMap = (members) => {
  const skillMap = new Map();

  for (const member of members || []) {
    const memberId = normalizeMemberId(member);
    const memberName = normalizeMemberName(member);

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
          : rawSkill?.proficiency,
      );

      const key =
        normalizedSkillName.toLowerCase();

      const memberRecord = {
        memberId,
        memberName,
        proficiency,
      };

      const existing = skillMap.get(key);

      if (!existing) {
        skillMap.set(key, {
          name: normalizedSkillName,
          highestProficiency: proficiency,
          primaryOwner: memberRecord,
          supportingMembers: [],
          memberCount: 1,
        });

        continue;
      }

      existing.memberCount += 1;

      if (
        proficiency > existing.highestProficiency
      ) {
        if (existing.primaryOwner) {
          existing.supportingMembers.push(
            existing.primaryOwner,
          );
        }

        existing.highestProficiency =
          proficiency;

        existing.primaryOwner =
          memberRecord;

        continue;
      }

      existing.supportingMembers.push(
        memberRecord,
      );
    }
  }

  for (const skill of skillMap.values()) {
    skill.supportingMembers =
      skill.supportingMembers
        .sort(
          (a, b) =>
            b.proficiency - a.proficiency,
        )
        .slice(0, 10);

    skill.isSinglePointOfFailure =
      skill.memberCount === 1;
  }

  return skillMap;
};

const calculateCoverage = (
  requiredSkill,
  teamSkill,
) => {
  if (!teamSkill) {
    return 0;
  }

  const proficiency = clampProficiency(
    teamSkill.highestProficiency,
  );

  const normalizedWeight =
    Number(requiredSkill.weight) || 0;

  return (
    (proficiency / 10) *
    normalizedWeight
  );
};

const calculateTeamResilience = (
  requiredSkills,
  teamSkillMap,
) => {
  let totalRelevantSkills = 0;
  let resilientSkills = 0;

  for (const requirement of requiredSkills) {
    const key =
      requirement.canonicalSkill.toLowerCase();

    const teamSkill = teamSkillMap.get(key);

    if (!teamSkill) {
      continue;
    }

    totalRelevantSkills += 1;

    /*
     * A skill is considered resilient when at least
     * two members have meaningful proficiency (>= 6).
     */
    const capableMemberCount =
      [
        teamSkill.primaryOwner,
        ...teamSkill.supportingMembers,
      ].filter(
        (member) => member.proficiency >= 6,
      ).length;

    if (capableMemberCount >= 2) {
      resilientSkills += 1;
    }
  }

  /*
   * No matched skills means there is no resilience
   * to measure yet. Keep it at 0 rather than inventing
   * a positive score.
   */
  if (totalRelevantSkills === 0) {
    return 0;
  }

  return Math.round(
    (resilientSkills /
      totalRelevantSkills) *
      100,
  );
};

export const calculateTeamFit = ({
  requiredSkills,
  teamProfile,
}) => {
  if (!Array.isArray(requiredSkills)) {
    throw new Error(
      "requiredSkills must be an array.",
    );
  }

  if (!teamProfile) {
    throw new Error(
      "teamProfile is required.",
    );
  }

  const teamSkillMap = buildTeamSkillMap(
    teamProfile.members || [],
  );

  const normalizedRequirements =
    requiredSkills
      .map((requirement) => ({
        ...requirement,

        skill:
          typeof requirement.skill ===
          "string"
            ? requirement.skill.trim()
            : "",

        canonicalSkill:
          normalizeSkill(
            requirement.canonicalSkill ||
              requirement.skill,
          ),

        weight:
          Number(requirement.weight) || 0,
      }))
      .filter(
        (requirement) =>
          requirement.skill &&
          requirement.canonicalSkill &&
          requirement.weight > 0,
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
      requirement.canonicalSkill.toLowerCase();

    const teamSkill =
      teamSkillMap.get(key);

    const coverage =
      calculateCoverage(
        requirement,
        teamSkill,
      );

    coveredWeight += coverage;

    if (!teamSkill) {
      const missingSkill = {
        ...requirement,
        coverage: 0,
      };

      missingSkills.push(
        missingSkill,
      );

      if (
        requirement.importance ===
          "Must Have" ||
        requirement.weight >= 8
      ) {
        criticalGaps.push(
          missingSkill,
        );
      }

      continue;
    }

    const proficiency =
      clampProficiency(
        teamSkill.highestProficiency,
      );

    const match = {
      ...requirement,
      proficiency,
      coverage:
        Math.round(
          coverage * 100,
        ) / 100,

      primaryOwner:
        teamSkill.primaryOwner,

      supportingMembers:
        teamSkill.supportingMembers,

      memberCount:
        teamSkill.memberCount,

      isSinglePointOfFailure:
        teamSkill.isSinglePointOfFailure,
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
          (coveredWeight /
            totalWeight) *
            100,
        );

  const teamResilience =
    calculateTeamResilience(
      normalizedRequirements,
      teamSkillMap,
    );

  return {
    score,

    totalWeight,

    coveredWeight:
      Math.round(
        coveredWeight * 100,
      ) / 100,

    teamSkills: Array.from(
      teamSkillMap.values(),
    ),

    matchedSkills,

    partialMatches,

    missingSkills,

    criticalGaps,

    teamResilience,

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