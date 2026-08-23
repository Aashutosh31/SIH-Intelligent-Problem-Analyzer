import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.status ?? error?.code;

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

export const generateGeminiContent = async ({
  prompt,
  systemInstruction,
  responseSchema,
  model = DEFAULT_MODEL,
  maxRetries = 2,
}) => {
  if (!prompt?.trim()) {
    throw new Error("Gemini prompt cannot be empty.");
  }

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          ...(systemInstruction && {
            systemInstruction,
          }),
          ...(responseSchema && {
            responseMimeType: "application/json",
            responseSchema,
          }),
        },
      });

      return response;
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `⚠️ Gemini request failed with a retryable error. ` +
          `Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};