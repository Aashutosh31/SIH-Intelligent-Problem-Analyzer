import { z } from "zod";

export const analysisZodSchema = z.object({
  identity: z.object({
    title: z.string(),
    domain: z.string(),
    coreProblem: z.string(),
  }),

  scorecard: z.object({
    difficulty: z.number().int().min(0).max(100),
    competition: z.number().int().min(0).max(100),
    innovation: z.number().int().min(0).max(100),
    teamFit: z.number().int().min(0).max(100),
    aiVibePotential: z.number().int().min(0).max(100),
    implementationRisk: z.number().int().min(0).max(100),
  }),

  engineeringInterpretation: z.object({
    whatItActuallyMeans: z.array(z.string()),

    components: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        complexity: z.enum(["High", "Medium", "Low"]),
      }),
    ),

    architecturePattern: z.string(),
  }),

  techStack: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    ai_ml: z.array(z.string()),
    database: z.array(z.string()),
  }),

  teamAndSkills: z.object({
    requiredSkills: z.array(
      z.object({
        skill: z.string(),
        importance: z.enum(["Must Have", "Good to Have", "Advanced"]),
        weight: z.number().int().min(1).max(10),
        reason: z.string(),
      }),
    ),
    recommendedComposition: z.string(),
  }),

  aiAndVibeCoding: z.object({
    opportunities: z.array(z.string()),
    dangerZones: z.array(z.string()),
    toolStack: z.array(z.string()),
  }),

  risks: z.object({
    redFlags: z.array(
      z.object({
        risk: z.string(),
        severity: z.enum(["Critical", "High", "Medium", "Low"]),
      }),
    ),

    datasetRisk: z.string(),
  }),

  verdict: z.object({
    decision: z.enum(["GO FOR IT", "GO FOR IT - BUT...", "CONSIDER", "AVOID"]),

    reasoning: z.string(),
  }),
});
