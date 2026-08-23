import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.status ?? error?.code;

  return [429, 500, 502, 503, 504].includes(status);
};

export const generateGeminiContent = async ({
  prompt,
  systemInstruction,
  model = DEFAULT_MODEL,
  maxRetries = 2,
}) => {
  if (!prompt?.trim()) {
    throw new Error("Gemini prompt cannot be empty.");
  }

  const contents = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      if (!response?.text) {
        throw new Error("Gemini returned an empty response.");
      }

      return response;
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `⚠️ Gemini request failed. Retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};