import { normalizeSkill } from "../utils/skillNormalizer.js";

const MIN_LEARNING_PROFICIENCY = 1;
const STRONG_PROFICIENCY = 8;
const PARTIAL_PROFICIENCY = 5;

const clampProficiency = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 5;
  }

  return Math.max(
    MIN_LEARNING_PROFICIENCY,
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
  if (typeof member?.name === "string" && member.name.trim()) {
    return member.name.trim();
  }

  return "Unnamed Member";
};

const getMemberRole = (member) => {
  if (typeof member?.role === "string" && member.role.trim()) {
    return member.role.trim();
  }

  return "";
};

/*
 * Weighted skill relationship map.
 *
 * This is intentionally deterministic rather than an open-ended semantic matcher.
 * We only award related-skill credit where the relationship is known and explainable.
 * Weights (0-1) indicate relevance: 1.0 = core relationship, 0.5 = tangential.
 * Generic skills (e.g., Python) have lower weights to avoid over-influencing scores.
 */
const SKILL_RELATIONSHIPS = {
  "computer vision": {
    "Deep Learning": 1.0,
    "Machine Learning": 0.9,
    "Image Processing": 0.9,
    OpenCV: 0.9,
    "Video Processing": 0.7,
    Python: 0.6,
  },

  "deep learning": {
    "Machine Learning": 1.0,
    PyTorch: 1.0,
    TensorFlow: 1.0,
    "Computer Vision": 0.8,
    Python: 0.7,
  },

  "machine learning": {
    "Deep Learning": 0.9,
    Python: 0.8,
    Statistics: 0.85,
    "Data Science": 0.9,
    "Computer Vision": 0.7,
  },

  "model optimization": {
    "Deep Learning": 1.0,
    "Machine Learning": 0.9,
    MLOps: 0.8,
    "GPU Computing": 0.8,
    Python: 0.6,
  },

  "asynchronous backend development": {
    "Backend Development": 1.0,
    "Distributed Systems": 0.9,
    Redis: 0.85,
    "Node.js": 0.8,
    FastAPI: 0.8,
    Docker: 0.6,
    Python: 0.5,
  },

  "backend development": {
    "Node.js": 1.0,
    Express: 1.0,
    FastAPI: 0.95,
    Python: 0.8,
    "REST API": 0.8,
    "Database Management": 0.5,
  },

  "full stack development": {
    "Frontend Development": 0.9,
    "Backend Development": 0.9,
    React: 0.9,
    "Node.js": 0.9,
    "Database Management": 0.6,
  },

  "video processing": {
    Python: 0.9,
    "Computer Vision": 0.95,
    FFmpeg: 1.0,
    OpenCV: 1.0,
    "Media Processing": 0.9,
  },

  "frontend development": {
    React: 1.0,
    JavaScript: 0.95,
    TypeScript: 0.9,
    "UI Development": 0.9,
    CSS: 0.7,
  },

  "database management": {
    MongoDB: 1.0,
    PostgreSQL: 1.0,
    SQL: 0.95,
    Mongoose: 0.9,
    "Database Design": 0.9,
  },

  "distributed systems": {
    "Backend Development": 1.0,
    Docker: 0.95,
    Redis: 0.9,
    Kubernetes: 1.0,
    "System Design": 0.9,
  },

  mlops: {
    "Machine Learning": 0.95,
    Docker: 0.9,
    Python: 0.75,
    "Model Deployment": 1.0,
    "Cloud Computing": 0.8,
  },
};

const getSkillFamily = (canonicalSkill) => {
  const relationships = SKILL_RELATIONSHIPS[canonicalSkill.toLowerCase()] || {};
  return Object.entries(relationships)
    .map(([skillName, relevance]) => {
      const normalized = normalizeSkill(skillName);
      return normalized ? { name: normalized, relevance } : null;
    })
    .filter(Boolean);
};

const buildMemberSkillMap = (member) => {
  const skillMap = new Map();

  for (const rawSkill of member.skills || []) {
    const name = typeof rawSkill === "string" ? rawSkill : rawSkill?.name;

    const normalized = normalizeSkill(name);

    if (!normalized) {
      continue;
    }

    skillMap.set(normalized.toLowerCase(), {
      name: normalized,
      proficiency: clampProficiency(
        typeof rawSkill === "string" ? 5 : rawSkill?.proficiency,
      ),
    });
  }

  return skillMap;
};

const calculateCandidateScore = ({ requirement, member }) => {
  const skillMap = buildMemberSkillMap(member);

  const targetSkill = normalizeSkill(
    requirement.canonicalSkill || requirement.skill,
  );

  if (!targetSkill) {
    return null;
  }

  const directMatch = skillMap.get(targetSkill.toLowerCase());

  /*
   * If the member already has the exact skill,
   * they are not a learning candidate.
   */
  if (directMatch) {
    return {
      eligible: false,
      score: 0,
      currentProficiency: directMatch.proficiency,
      basis: "direct-match",
      relatedSkills: [],
    };
  }

  const relatedSkills = [];

  const family = getSkillFamily(targetSkill);

  for (const relatedSkillDef of family) {
    const existing = skillMap.get(relatedSkillDef.name.toLowerCase());

    if (!existing) {
      continue;
    }

    relatedSkills.push({
      name: existing.name,
      proficiency: existing.proficiency,
      relevance: relatedSkillDef.relevance,
    });
  }

  const strongestRelatedSkill = relatedSkills.reduce((strongest, current) => {
    if (!strongest) {
      return current;
    }

    return current.proficiency > strongest.proficiency ? current : strongest;
  }, null);

  /*
   * Weighted score rewards related capability with relevance factored in.
   *
   * 0–40: weighted related skill contribution (proficiency × relevance)
   * 0–30: role alignment
   * 0–20: willingness to learn
   * 0–10: general learning capacity reserve
   */
  let score = 0;

  if (relatedSkills.length > 0) {
    /*
     * Weighted contribution: proficiency × relevance.
     * Normalize by highest possible (10 × 1.0 = 10) to keep at most 40 points.
     */
    const weightedSum = relatedSkills.reduce(
      (sum, skill) => sum + (skill.proficiency / 10) * skill.relevance,
      0,
    );

    const maxWeightedContribution = relatedSkills.length; // worst case: each skill at weight 1.0

    const normalizedWeightedScore = Math.min(
      40,
      (weightedSum / maxWeightedContribution) * 40,
    );

    score += normalizedWeightedScore;
  }

  const normalizedRole = getMemberRole(member).toLowerCase();

  const roleMatchesTarget = normalizedRole.includes(targetSkill.toLowerCase());

  const roleMatchesFamily = family.some((skillDef) =>
    normalizedRole.includes(skillDef.name.toLowerCase()),
  );

  if (roleMatchesTarget) {
    score += 30;
  } else if (roleMatchesFamily) {
    score += 18;
  }

  const willingness = clampProficiency(
    member.preferences?.willingnessToLearn ?? 5,
  );

  score += (willingness / 10) * 20;

  // Small bonus for general learning capacity even without direct connections
  if (relatedSkills.length === 0) {
    score += 10;
  }

  return {
    eligible: score > 0,
    score: Math.min(100, Math.round(score)),
    currentProficiency: strongestRelatedSkill?.proficiency || 0,

    basis: strongestRelatedSkill
      ? "related-skill"
      : "general-learning-capacity",

    relatedSkills,
  };
};

const determineDifficulty = ({ currentProficiency, score }) => {
  if (currentProficiency >= 8 || score >= 80) {
    return "Low";
  }

  if (currentProficiency >= 5 || score >= 50) {
    return "Medium";
  }

  return "High";
};

const determinePriority = (requirement) => {
  if (
    requirement.importance === "Must Have" ||
    Number(requirement.weight) >= 8
  ) {
    return "Critical";
  }

  if (Number(requirement.weight) >= 5) {
    return "High";
  }

  return "Medium";
};

export const calculateSkillGapRecommendations = ({
  requiredSkills,
  teamProfile,
}) => {
  if (!Array.isArray(requiredSkills)) {
    throw new Error("requiredSkills must be an array.");
  }

  if (!teamProfile) {
    throw new Error("teamProfile is required.");
  }

  const members = teamProfile.members || [];

  const recommendations = [];
  const unresolvedGaps = [];

  for (const requirement of requiredSkills) {
    const canonicalSkill = normalizeSkill(
      requirement.canonicalSkill || requirement.skill,
    );

    if (!canonicalSkill) {
      continue;
    }

    /*
     * Check whether someone already has the
     * capability strongly enough.
     */
    const strongOwners = [];

    for (const member of members) {
      const skillMap = buildMemberSkillMap(member);

      const existing = skillMap.get(canonicalSkill.toLowerCase());

      if (existing && existing.proficiency >= STRONG_PROFICIENCY) {
        strongOwners.push({
          member,
          proficiency: existing.proficiency,
        });
      }
    }

    /*
     * Already strongly covered.
     * There is no learning gap to recommend.
     */
    if (strongOwners.length > 0) {
      continue;
    }

    const candidates = members
      .map((member) => {
        const candidate = calculateCandidateScore({
          requirement: {
            ...requirement,
            canonicalSkill,
          },
          member,
        });

        if (!candidate?.eligible) {
          return null;
        }

        return {
          member,
          ...candidate,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    const priority = determinePriority(requirement);

    if (candidates.length === 0) {
      const unresolved = {
        skill: requirement.skill,
        canonicalSkill,
        importance: requirement.importance,
        weight: requirement.weight,
        priority,
        status: "unresolvable",
        recommendation:
          "No suitable existing team member was identified as a learning candidate.",
      };

      unresolvedGaps.push(unresolved);

      continue;
    }

    const bestCandidate = candidates[0];

    const candidateProfile = bestCandidate.member;

    const relatedSkills = bestCandidate.relatedSkills;

    const difficulty = determineDifficulty({
      currentProficiency: bestCandidate.currentProficiency,
      score: bestCandidate.score,
    });

    /*
     * For a missing direct skill, the current proficiency is always 0.
     * The related skills (stored separately) indicate the learner's foundation.
     */
    const gapSize = 0;

    let reasoning;

    if (relatedSkills.length > 0) {
      const strongestRelated = relatedSkills.reduce(
        (strongest, current) =>
          !strongest || current.proficiency > strongest.proficiency
            ? current
            : strongest,
        null,
      );

      reasoning = `${getMemberName(candidateProfile)} already has ${strongestRelated.name} at ${strongestRelated.proficiency}/10, making them the strongest existing foundation for learning ${canonicalSkill}.`;
    } else {
      reasoning = `${getMemberName(candidateProfile)} has the strongest overall learning profile among the current team members for acquiring ${canonicalSkill}.`;
    }

    recommendations.push({
      skill: requirement.skill,
      canonicalSkill,

      importance: requirement.importance,

      weight: requirement.weight,

      priority,

      recommendedLearner: {
        memberId: getMemberId(candidateProfile),
        memberName: getMemberName(candidateProfile),
        role: getMemberRole(candidateProfile),
      },

      currentProficiency: gapSize,

      targetProficiency: STRONG_PROFICIENCY,

      proficiencyGap: STRONG_PROFICIENCY - gapSize,

      difficulty,

      confidence: Math.min(100, bestCandidate.score),

      relatedSkills,

      reasoning,
    });
  }

  return {
    recommendations,
    unresolvedGaps,
    totalGaps: recommendations.length + unresolvedGaps.length,

    criticalGaps:
      recommendations.filter((item) => item.priority === "Critical").length +
      unresolvedGaps.filter((item) => item.priority === "Critical").length,
  };
};
