// Groq fallback provider for the analysis pipeline.
//
// Mirrors the architecture of geminiProvider.js:
//   generateGroqContent({ prompt, systemInstruction, model, maxRetries })
//     -> { text }
//
// The returned shape is intentionally identical to the Gemini provider's
// response shape so the existing pipeline (JSON.parse +
// normalizeGeminiAnalysis) works unchanged — no separate Groq response
// format, no duplicated normalization.
//
// Differences from Gemini:
// - Groq is OPTIONAL. This module must never throw at import time when
//   GROQ_API_KEY is absent; isGroqConfigured() reports availability and
//   generateGroqContent() throws a PROVIDER_NOT_CONFIGURED error if called
//   without a key (classified as non-transient, so it never triggers
//   further fallback attempts).
// - Transport is Groq's OpenAI-compatible Chat Completions REST API via
//   the built-in fetch (no extra dependency).
// - Structured output uses response_format json_object plus the same
//   "return ONLY valid JSON" system instruction Gemini receives.

import { config } from "../config.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL = config.groqModel;

// Upper bound for a single Groq attempt. Kept below the Gemini timeout so
// the combined Gemini-then-Groq path stays bounded for a public endpoint.
const REQUEST_TIMEOUT_MS =
  Number(process.env.GROQ_REQUEST_TIMEOUT_MS) || 45000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Resolved from the live environment at call time (not cached at import),
// so availability checks observe key rotation and tests can control them.
// In the server process dotenv (via config.js) populates process.env at
// startup, so no separate fallback is needed.
const resolveApiKey = () => process.env.GROQ_API_KEY || "";

export const isGroqConfigured = () => Boolean(resolveApiKey());

const isRetryableStatus = (status) =>
  [429, 500, 502, 503, 504].includes(status);

const isAbortError = (error) =>
  error?.name === "AbortError" ||
  error?.code === "ABORT_ERR" ||
  /aborted|abort/i.test(error?.message || "");

const notConfiguredError = () => {
  const error = new Error(
    "Groq fallback is not configured. Set GROQ_API_KEY to enable it."
  );
  error.code = "PROVIDER_NOT_CONFIGURED";
  error.status = 500;
  return error;
};

export const generateGroqContent = async ({
  prompt,
  systemInstruction,
  model = DEFAULT_MODEL,
  maxRetries = 1,
}) => {
  if (!prompt?.trim()) {
    throw new Error("Groq prompt cannot be empty.");
  }

  const apiKey = resolveApiKey();

  if (!apiKey) {
    throw notConfiguredError();
  }

  const messages = [];

  if (systemInstruction?.trim()) {
    messages.push({ role: "system", content: systemInstruction });
  }

  messages.push({ role: "user", content: prompt });

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;

    let timeoutId;

    try {
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller?.abort();

          const timeoutError = new Error("Groq request timed out.");
          timeoutError.name = "GroqTimeoutError";
          timeoutError.status = 504;
          reject(timeoutError);
        }, REQUEST_TIMEOUT_MS);
      });

      const request = fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        }),
        ...(controller ? { signal: controller.signal } : {}),
      });

      const response = await Promise.race([request, timeout]);

      let payload;

      try {
        payload = await response.json();
      } catch {
        throw Object.assign(
          new Error("Groq returned an invalid response payload."),
          { status: 502 }
        );
      }

      if (!response.ok) {
        // Never include the response body in the error: it is untrusted
        // provider output. Status code alone drives classification.
        throw Object.assign(
          new Error(`Groq request failed with status ${response.status}.`),
          { status: response.status }
        );
      }

      const text = payload?.choices?.[0]?.message?.content;

      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Groq returned an empty response.");
      }

      return { text };
    } catch (error) {
      lastError = error;

      // Timeouts/aborts are terminal for this provider (Groq is already the
      // last resort — there is nothing left to fall back to).
      if (isAbortError(error) || error?.name === "GroqTimeoutError") {
        throw error;
      }

      const status = error?.status;

      if (!isRetryableStatus(status) || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      // Status code only. Never log prompts, keys, or response bodies.
      console.warn(
        `Groq request failed with status ${status}. Retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
};
