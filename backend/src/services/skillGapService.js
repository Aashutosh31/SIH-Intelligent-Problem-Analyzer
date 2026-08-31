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
 * Small, explicit capability-family map.
 *
 * This is intentionally deterministic rather than an open-ended
 * semantic matcher. We only award related-skill credit where the
 * relationship is known and explainable.
 */
const SKILL_FAMILIES = {
  "computer vision": [
    "Machine Learning",
    "Deep Learning",
    "Python",
    "OpenCV",
    "Image Processing",
    "Video Processing",
  ],

  "deep learning": [
    "Machine Learning",
    "Python",
    "PyTorch",
    "TensorFlow",
    "Computer Vision",
  ],

  "machine learning": [
    "Python",
    "Deep Learning",
    "Statistics",
    "Data Science",
    "Computer Vision",
  ],

  "model optimization": [
    "Machine Learning",
    "Deep Learning",
    "Python",
    "MLOps",
    "GPU Computing",
  ],

  "asynchronous backend development": [
    "Backend Development",
    "Node.js",
    "Python",
    "FastAPI",
    "Redis",
    "Docker",
    "Distributed Systems",
  ],

  "backend development": [
    "Node.js",
    "Express",
    "Python",
    "FastAPI",
    "REST API",
    "Database Management",
  ],

  "full stack development": [
    "Frontend Development",
    "Backend Development",
    "React",
    "Node.js",
    "Database Management",
  ],

  "video processing": [
    "Python",
    "Computer Vision",
    "FFmpeg",
    "OpenCV",
    "Media Processing",
  ],

  "frontend development": [
    "React",
    "JavaScript",
    "TypeScript",
    "CSS",
    "UI Development",
  ],

  "database management": [
    "MongoDB",
    "PostgreSQL",
    "SQL",
    "Mongoose",
    "Database Design",
  ],

  "distributed systems": [
    "Backend Development",
    "Docker",
    "Redis",
    "Kubernetes",
    "System Design",
  ],

  mlops: [
    "Machine Learning",
    "Docker",
    "Python",
    "Model Deployment",
    "Cloud Computing",
  ],
};

const getSkillFamily = (canonicalSkill) => {
  return (SKILL_FAMILIES[canonicalSkill.toLowerCase()] || [])
    .map((skill) => normalizeSkill(skill))
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

  for (const relatedSkill of family) {
    const existing = skillMap.get(relatedSkill.toLowerCase());

    if (!existing) {
      continue;
    }

    relatedSkills.push({
      name: existing.name,
      proficiency: existing.proficiency,
    });
  }

  const strongestRelatedSkill = relatedSkills.reduce((strongest, current) => {
    if (!strongest) {
      return current;
    }

    return current.proficiency > strongest.proficiency ? current : strongest;
  }, null);

  /*
   * Base score rewards related capability.
   *
   * 0–40: related skill coverage
   * 0–30: proficiency of strongest related skill
   * 0–20: role alignment
   * 0–10: willingness to learn
   */
  let score = 0;

  if (strongestRelatedSkill) {
    score += 40;

    score += (strongestRelatedSkill.proficiency / 10) * 30;
  }

  const normalizedRole = getMemberRole(member).toLowerCase();

  const roleMatchesTarget = normalizedRole.includes(targetSkill.toLowerCase());

  const roleMatchesFamily = family.some((skill) =>
    normalizedRole.includes(skill.toLowerCase()),
  );

  if (roleMatchesTarget) {
    score += 20;
  } else if (roleMatchesFamily) {
    score += 12;
  }

  const willingness = clampProficiency(
    member.preferences?.willingnessToLearn ?? 5,
  );

  score += (willingness / 10) * 10;

  return {
    eligible: score > 0,
    score: Math.round(score),
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
