import { generateGeminiContent } from "./geminiProvider.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../prompts/analysisPrompt.js";
import { analysisSchema } from "../prompts/analysisSchema.js";

const parseGeminiJson = (response) => {
  if (!response?.text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("❌ Failed to parse Gemini JSON:", response.text);
    throw new Error("Gemini returned invalid JSON.");
  }
};

const validateAnalysisResult = (analysis) => {
  if (!analysis || typeof analysis !== "object") {
    throw new Error("Analysis result must be an object.");
  }

  const requiredSections = [
    "identity",
    "scorecard",
    "engineeringInterpretation",
    "techStack",
    "teamAndSkills",
    "aiAndVibeCoding",
    "risks",
    "verdict",
  ];

  for (const section of requiredSections) {
    if (!(section in analysis)) {
      throw new Error(
        `Gemini analysis is missing required section: ${section}`
      );
    }
  }

  const scoreFields = [
    "difficulty",
    "competition",
    "innovation",
    "teamFit",
    "aiVibePotential",
    "implementationRisk",
  ];

  for (const field of scoreFields) {
    const score = analysis.scorecard[field];

    if (
      typeof score !== "number" ||
      score < 0 ||
      score > 100
    ) {
      throw new Error(
        `Invalid scorecard value for "${field}".`
      );
    }
  }

  return analysis;
};

export const analyzeProblem = async (problemStatement) => {
  const prompt = `
Analyze the following Smart India Hackathon problem statement.

PROBLEM STATEMENT
-----------------
${problemStatement}
-----------------

Remember:
- Base your analysis on the actual supplied statement.
- Do not invent external research.
- Competition is only an analytical estimate in this phase.
- Team fit is preliminary because no personalized team profile is being supplied yet.
- Return only JSON matching the provided schema.
`;

  const response = await generateGeminiContent({
    prompt,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    responseSchema: analysisSchema,
  });

  const analysis = parseGeminiJson(response);

  return validateAnalysisResult(analysis);
};