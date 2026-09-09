import { generateAnalysisContent } from "./analysisProvider.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../prompts/analysisPrompt.js";
import { normalizeGeminiAnalysis } from "./analysisNormalizer.js";
import { calculateTeamFit } from "./teamFitService.js";
import { calculateTaskAllocation } from "./taskAllocationService.js";
import {calculateSkillGapRecommendations} from "./skillGapService.js";

export const analyzeProblem = async ({
  problemStatement,
  teamProfile = null,
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

  // Gemini is the primary provider; Groq is attempted automatically only
  // when Gemini fails transiently AND a Groq key is configured. The result
  // shape is provider-independent: raw text goes through the same shared
  // JSON parse + normalizer either way.
  const { text: rawText, provider } = await generateAnalysisContent({
    prompt,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
  });

  const providerLabel = provider === "groq" ? "Groq" : "Gemini";

  let rawAnalysis;

  try {
    rawAnalysis = JSON.parse(rawText);
  } catch {
    const length = rawText?.length ?? 0;

    throw new Error(
      `${providerLabel} returned invalid JSON (response length: ${length}).`
    );
  }

  const analysis = normalizeGeminiAnalysis(rawAnalysis);

  /*
   * Team Fit is application-owned logic.
   * Gemini determines required skills.
   * Our backend determines how well the actual team matches them.
   */
  if (teamProfile) {
    const requiredSkills = analysis.teamAndSkills.requiredSkills;

    const teamFit = calculateTeamFit({
      requiredSkills,
      teamProfile,
    });
    
    const taskAllocation = calculateTaskAllocation({
      requiredSkills,
      teamProfile,
    });

    const skillGapRecommendations = calculateSkillGapRecommendations({
      requiredSkills,
      teamProfile,
    });
    
    analysis.scorecard.teamFit = teamFit.score;
    
    analysis.teamFit = teamFit;
    analysis.taskAllocation = taskAllocation;
    analysis.skillGapRecommendations = skillGapRecommendations;
  }

  if (provider === "groq") {
    console.log("✅ Groq fallback analysis generated successfully.");
  } else {
    console.log("✅ Gemini analysis generated successfully.");
  }

  return analysis;
};
