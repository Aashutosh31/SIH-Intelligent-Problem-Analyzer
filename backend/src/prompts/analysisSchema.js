export const analysisSchema = {
  type: "object",
  properties: {
    identity: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        domain: {
          type: "string",
        },
        coreProblem: {
          type: "string",
        },
      },
      required: ["title", "domain", "coreProblem"],
    },

    scorecard: {
      type: "object",
      properties: {
        difficulty: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        competition: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        innovation: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        teamFit: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        aiVibePotential: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        implementationRisk: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
      },
      required: [
        "difficulty",
        "competition",
        "innovation",
        "teamFit",
        "aiVibePotential",
        "implementationRisk",
      ],
    },

    engineeringInterpretation: {
      type: "object",
      properties: {
        whatItActuallyMeans: {
          type: "array",
          items: {
            type: "string",
          },
        },
        components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              description: {
                type: "string",
              },
              complexity: {
                type: "string",
                enum: ["High", "Medium", "Low"],
              },
            },
            required: ["name", "description", "complexity"],
          },
        },
        architecturePattern: {
          type: "string",
        },
      },
      required: [
        "whatItActuallyMeans",
        "components",
        "architecturePattern",
      ],
    },

    techStack: {
      type: "object",
      properties: {
        frontend: {
          type: "array",
          items: {
            type: "string",
          },
        },
        backend: {
          type: "array",
          items: {
            type: "string",
          },
        },
        ai_ml: {
          type: "array",
          items: {
            type: "string",
          },
        },
        database: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: ["frontend", "backend", "ai_ml", "database"],
    },

    teamAndSkills: {
      type: "object",
      properties: {
        mustHave: {
          type: "array",
          items: {
            type: "string",
          },
        },
        goodToHave: {
          type: "array",
          items: {
            type: "string",
          },
        },
        recommendedComposition: {
          type: "string",
        },
      },
      required: [
        "mustHave",
        "goodToHave",
        "recommendedComposition",
      ],
    },

    aiAndVibeCoding: {
      type: "object",
      properties: {
        opportunities: {
          type: "array",
          items: {
            type: "string",
          },
        },
        dangerZones: {
          type: "array",
          items: {
            type: "string",
          },
        },
        toolStack: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: [
        "opportunities",
        "dangerZones",
        "toolStack",
      ],
    },

    risks: {
      type: "object",
      properties: {
        redFlags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              risk: {
                type: "string",
              },
              severity: {
                type: "string",
                enum: ["Critical", "High", "Medium", "Low"],
              },
            },
            required: ["risk", "severity"],
          },
        },
        datasetRisk: {
          type: "string",
        },
      },
      required: ["redFlags", "datasetRisk"],
    },

    verdict: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: [
            "GO FOR IT",
            "GO FOR IT - BUT...",
            "CONSIDER",
            "AVOID",
          ],
        },
        reasoning: {
          type: "string",
        },
      },
      required: ["decision", "reasoning"],
    },
  },

  required: [
    "identity",
    "scorecard",
    "engineeringInterpretation",
    "techStack",
    "teamAndSkills",
    "aiAndVibeCoding",
    "risks",
    "verdict",
  ],
};