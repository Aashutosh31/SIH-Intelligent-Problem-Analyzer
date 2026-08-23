import { generateGeminiContent } from "./geminiProvider.js";
import { ANALYSIS_SYSTEM_PROMPT } from "../prompts/analysisPrompt.js";
import { normalizeGeminiAnalysis } from "./analysisNormalizer.js";
import { analysisZodSchema } from "../prompts/analysisSchema.js";

export const analyzeProblem = async (problemStatement) => {
  const prompt = `
Analyze this Smart India Hackathon problem statement:

${problemStatement}

Return ONLY valid JSON using the structure and field names specified by the system instructions.
`;

  const response = await generateGeminiContent({
    prompt,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
  });

  let rawAnalysis;

  try {
    rawAnalysis = JSON.parse(response.text);
  } catch (error) {
    console.error(
      "Gemini returned non-JSON output:",
      response.text
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }

  const normalized =
    normalizeGeminiAnalysis(rawAnalysis);

  return analysisZodSchema.parse(normalized);
};