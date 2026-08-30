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

const getMemberId = (member) => {
  if (member?._id) {
    return String(member._id);
  }

  if (member?.id) {
    return String(member.id);
  }

  return null;
};

const getMemberName = (member) => {
  if (
    typeof member?.name === "string" &&
    member.name.trim()
  ) {
    return member.name.trim();
  }

  return "Unnamed Member";
};

const getMemberCandidates = (
  members,
  canonicalSkill,
) => {
  const candidates = [];

  for (const member of members || []) {
    for (const rawSkill of member.skills || []) {
      const skillName =
        typeof rawSkill === "string"
          ? rawSkill
          : rawSkill?.name;

      const normalizedSkill =
        normalizeSkill(skillName);

      if (
        !normalizedSkill ||
        normalizedSkill.toLowerCase() !==
          canonicalSkill.toLowerCase()
      ) {
        continue;
      }

      candidates.push({
        memberId: getMemberId(member),
        memberName: getMemberName(member),
        role:
          typeof member?.role === "string"
            ? member.role.trim()
            : "",
        proficiency: clampProficiency(
          typeof rawSkill === "string"
            ? 5
            : rawSkill?.proficiency,
        ),
      });
    }
  }

  return candidates.sort(
    (a, b) =>
      b.proficiency - a.proficiency,
  );
};

export const calculateTaskAllocation = ({
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

  const members = teamProfile.members || [];

  const memberAllocationMap = new Map();

  for (const member of members) {
    const memberId = getMemberId(member);

    memberAllocationMap.set(memberId, {
      memberId,
      memberName: getMemberName(member),
      role:
        typeof member?.role === "string"
          ? member.role.trim()
          : "",
      assignments: [],
    });
  }

  const unassignedRequirements = [];
  const bottlenecks = [];
  const singleOwnerRisks = [];

  for (const requirement of requiredSkills) {
    const canonicalSkill =
      normalizeSkill(
        requirement.canonicalSkill ||
          requirement.skill,
      );

    if (!canonicalSkill) {
      continue;
    }

    const candidates =
      getMemberCandidates(
        members,
        canonicalSkill,
      );

    const requirementRecord = {
      skill: requirement.skill,
      canonicalSkill,
      importance:
        requirement.importance,
      weight: requirement.weight,
      reason: requirement.reason,
    };

    if (candidates.length === 0) {
      const unassigned = {
        ...requirementRecord,
        status: "unassigned",
      };

      unassignedRequirements.push(
        unassigned,
      );

      if (
        requirement.importance ===
          "Must Have" ||
        Number(requirement.weight) >= 8
      ) {
        bottlenecks.push({
          ...unassigned,
          reason:
            "No team member currently has this capability.",
        });
      }

      continue;
    }

    const primaryOwner = candidates[0];

    const supportingMembers =
      candidates.slice(1);

    const assignment = {
      ...requirementRecord,

      proficiency:
        primaryOwner.proficiency,

      primaryOwner,

      supportingMembers,

      memberCount: candidates.length,

      isSinglePointOfFailure:
        candidates.length === 1,
    };

    const ownerAllocation =
      memberAllocationMap.get(
        primaryOwner.memberId,
      );

    if (ownerAllocation) {
      ownerAllocation.assignments.push(
        assignment,
      );
    }

    if (
      candidates.length === 1 &&
      primaryOwner.proficiency < 8
    ) {
      singleOwnerRisks.push({
        ...assignment,
        reason:
          "Only one team member has this capability, and their proficiency is below the strong-match threshold.",
      });
    } else if (
      candidates.length === 1 &&
      primaryOwner.proficiency >= 8
    ) {
      singleOwnerRisks.push({
        ...assignment,
        reason:
          "Only one team member currently owns this capability.",
      });
    }
  }

  const memberAllocations =
    Array.from(
      memberAllocationMap.values(),
    ).filter(
      (member) =>
        member.assignments.length > 0,
    );

  return {
    memberAllocations,
    unassignedRequirements,
    bottlenecks,
    singleOwnerRisks,
  };
};