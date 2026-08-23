const clampScore = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item !== null && item !== undefined)
    .map((item) =>
      typeof item === "string" ? item : JSON.stringify(item)
    );
};

export const normalizeGeminiAnalysis = (raw) => {
  if (!raw || typeof raw !== "object") {
    throw new Error("Gemini returned an invalid analysis object.");
  }

  // Already canonical.
  if (
    raw.identity &&
    raw.scorecard &&
    raw.engineeringInterpretation
  ) {
    return raw;
  }

  // Rich Gemini format.
  const scores = raw.scores || {};
  const engineering = raw.engineering_interpretation || {};
  const architecture = raw.recommended_architecture || {};
  const tech = raw.tech_stack || {};
  const ai = raw.ai_vibe_coding || {};
  const risks = raw.risks_and_challenges || {};
  const verdict = raw.verdict_and_strategy || {};

  if (!raw.problem_summary) {
    throw new Error(
      "Gemini returned an unsupported analysis format."
    );
  }

  return {
    identity: {
      title:
        engineering.core_objective ||
        "SIH Problem Analysis",

      domain: "Smart India Hackathon",

      coreProblem: raw.problem_summary,
    },

    scorecard: {
      difficulty: clampScore(
        scores.overall_difficulty
      ),

      competition: clampScore(
        scores.competition_level
      ),

      innovation: clampScore(
        scores.innovation_potential
      ),

      teamFit: clampScore(
        scores.preliminary_team_fit
      ),

      aiVibePotential: clampScore(
        scores.ai_vibe_coding_potential
      ),

      implementationRisk: clampScore(
        scores.implementation_risk
      ),
    },

    engineeringInterpretation: {
      whatItActuallyMeans: [
        ...(engineering.core_objective
          ? [engineering.core_objective]
          : []),

        ...normalizeArray(
          engineering.key_processing_steps
        ),
      ],

      components: [
        ...normalizeArray(
          engineering.core_components
        ).map((component) => ({
          name: component,
          description:
            "Core component identified from the problem analysis.",
          complexity: "Medium",
        })),

        ...normalizeArray(
          engineering.external_dependencies
        ).map((dependency) => ({
          name: dependency,
          description:
            "External dependency identified from the problem analysis.",
          complexity: "High",
        })),
      ],

      architecturePattern:
        architecture.pattern ||
        "Modular Application Architecture",
    },

    techStack: {
      frontend: normalizeArray(tech.frontend),
      backend: normalizeArray(tech.backend),
      ai_ml: normalizeArray(tech.ai_ml),
      database: normalizeArray(tech.database),
    },

    teamAndSkills: {
      mustHave: normalizeArray(
        raw.required_skills
      ),

      goodToHave: [
        ...normalizeArray(
          engineering.ai_ml_requirements
        ),

        ...normalizeArray(
          engineering.hardware_requirements
        ),
      ],

      recommendedComposition:
        "Determine the final team composition after the user's team profile is provided.",
    },

    aiAndVibeCoding: {
      opportunities: normalizeArray(
        ai.high_leverage_areas
      ),

      dangerZones: normalizeArray(
        ai.human_validation_required
      ),

      toolStack: [],
    },

    risks: {
      redFlags: [
        ...normalizeArray(
          risks.technical_risks
        ).map((risk) => ({
          risk,
          severity: "High",
        })),

        ...normalizeArray(
          risks.operational_risks
        ).map((risk) => ({
          risk,
          severity: "Medium",
        })),
      ],

      datasetRisk:
        normalizeArray(
          engineering.ai_ml_requirements
        ).length > 0
          ? "Dataset availability and quality must be evaluated for the identified AI/ML requirements."
          : "No significant dataset dependency identified at this analysis stage.",
    },

    verdict: {
      decision:
        verdict.verdict ||
        "CONSIDER",

      reasoning:
        verdict.rationale ||
        "Further evaluation is recommended.",
    },

    intelligence: {
      users: normalizeArray(
        engineering.users
      ),

      inputs: normalizeArray(
        engineering.inputs
      ),

      outputs: normalizeArray(
        engineering.outputs
      ),

      keyProcessingSteps: normalizeArray(
        engineering.key_processing_steps
      ),

      coreComponents: normalizeArray(
        engineering.core_components
      ),

      externalDependencies: normalizeArray(
        engineering.external_dependencies
      ),

      aiMlRequirements: normalizeArray(
        engineering.ai_ml_requirements
      ),

      hardwareRequirements: normalizeArray(
        engineering.hardware_requirements
      ),

      infrastructureRequirements: normalizeArray(
        engineering.infrastructure_requirements
      ),

      architectureBreakdown:
        architecture.breakdown || null,

      devopsCloud: normalizeArray(
        tech.devops_cloud
      ),

      stackReasons: normalizeArray(
        tech.reasons
      ),

      differentiationStrategy:
        verdict.winning_differentiation_strategy ||
        null,
    },
  };
};