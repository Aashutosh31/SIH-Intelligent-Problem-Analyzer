import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

if (!config.geminiApiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured. In production this is required and the server cannot start without it."
  );
}

const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
});

const DEFAULT_MODEL = config.geminiModel;

// Upper bound for a single generateContent attempt.
const REQUEST_TIMEOUT_MS =
  Number(process.env.GEMINI_REQUEST_TIMEOUT_MS) || 60000;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.status ?? error?.code;

  return [429, 500, 502, 503, 504].includes(status);
};

const isAbortError = (error) =>
  error?.name === "AbortError" ||
  error?.code === "ABORT_ERR" ||
  /aborted|abort/i.test(error?.message || "");

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

  const runAttempt = () => {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;

    const responsePromise = controller
      ? ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
            abortSignal: controller.signal,
          },
        })
      : ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

    let timeoutId;

    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        // Abort the underlying request when a controller is available.
        controller?.abort();

        const err = new Error("Gemini request timed out.");
        err.name = "GeminiTimeoutError";
        err.status = 504;
        reject(err);
      }, REQUEST_TIMEOUT_MS);
    });

    return Promise.race([responsePromise, timeout]).finally(() => {
      clearTimeout(timeoutId);
    });
  };

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await runAttempt();

      if (!response?.text) {
        throw new Error("Gemini returned an empty response.");
      }

      return response;
    } catch (error) {
      lastError = error;

      // A timeout/abort is not transient; do not retry it.
      if (isAbortError(error) || error?.name === "GeminiTimeoutError") {
        throw error;
      }

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