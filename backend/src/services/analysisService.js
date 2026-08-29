import { generateGeminiContent } from "./geminiProvider.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../prompts/analysisPrompt.js";
import { normalizeGeminiAnalysis } from "./analysisNormalizer.js";
import TeamProfile from "../models/TeamProfile.js";
import { calculateTeamFit } from "./teamFitService.js";

export const analyzeProblem = async ({
  problemStatement,
  teamId = null,
}) => {
  const prompt = `
Analyze this Smart India Hackathon problem statement.

PROBLEM STATEMENT
-----------------
${problemStatement}
-----------------

Return ONLY valid JSON using the structure and field names specified
by the system instructions.

Analyze deeply:

- what the problem actually demands
- core objective
- users
- inputs
- outputs
- processing pipeline
- system components
- architecture
- technology stack
- required skills
- AI/ML requirements
- hardware requirements
- infrastructure requirements
- AI/vibe-coding opportunities
- human validation areas
- technical risks
- operational risks
- strategic recommendation
- differentiation strategy

Competition must remain an analytical estimate.
Do not invent external statistics or research.
`;

  if (!problemStatement?.trim()) {
    throw new Error("Problem statement cannot be empty.");
  }

  const response = await generateGeminiContent({
    prompt,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
  });

  let rawAnalysis;

  try {
    rawAnalysis = JSON.parse(response.text);
  } catch (error) {
    console.error(
      "Gemini returned invalid JSON:",
      response.text
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }

  const analysis =
    normalizeGeminiAnalysis(rawAnalysis);

  /*
   * Team Fit is application-owned logic.
   * Gemini determines required skills.
   * Our backend determines how well the actual team matches them.
   */
  if (teamId) {
    const teamProfile =
      await TeamProfile.findOne({ teamId }).lean();

    if (teamProfile) {
      const teamFit = calculateTeamFit({
        requiredSkills:
          analysis.teamAndSkills.requiredSkills,
        teamProfile,
      });

      analysis.scorecard.teamFit =
        teamFit.score;

      analysis.teamFit = teamFit;
    }
  }

  console.log(
    "✅ Gemini analysis generated successfully."
  );

  return analysis;
};