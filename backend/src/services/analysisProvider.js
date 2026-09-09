// Provider orchestration for analysis generation.
//
// Flow is strictly one-directional:
//
//   Gemini -> (transient failure only) -> Groq -> fail
//
// There is no Groq -> Gemini loop. From the API client's perspective one
// analysis request is still ONE request: the existing route-level rate
// limiter counts the HTTP request, not the internal provider attempts.
//
// The optional `deps` parameter exists for tests (dependency injection).
// Production callers omit it and get the real providers.

import { generateGeminiContent } from "./geminiProvider.js";
import { generateGroqContent, isGroqConfigured } from "./groqProvider.js";
import { isTransientProviderError } from "./providerErrors.js";

export const generateAnalysisContent = async (
  { prompt, systemInstruction },
  deps = {}
) => {
  const geminiGenerate = deps.generateGeminiContent ?? generateGeminiContent;
  const groqGenerate = deps.generateGroqContent ?? generateGroqContent;
  const groqAvailable = deps.groqConfigured ?? isGroqConfigured();

  try {
    const response = await geminiGenerate({ prompt, systemInstruction });

    return { text: response.text, provider: "gemini" };
  } catch (geminiError) {
    // Fallback only for transient provider-availability failures, and only
    // when a Groq key is actually configured. Auth errors, bad input,
    // programmer errors, and missing Groq configuration propagate the
    // original Gemini error unchanged (existing error semantics).
    if (!groqAvailable || !isTransientProviderError(geminiError)) {
      throw geminiError;
    }

    // Server log identifies the provider. Never log the prompt, the problem
    // statement, team tokens, API keys, or raw model output.
    console.warn("Gemini unavailable, using Groq fallback.");

    try {
      const fallback = await groqGenerate({ prompt, systemInstruction });

      return { text: fallback.text, provider: "groq" };
    } catch (groqError) {
      console.error(
        "Groq fallback failed:",
        groqError?.name ?? "Error",
        groqError?.status ?? "unknown status"
      );

      // Preserve the existing API contract: the client sees the same error
      // it would have seen in the Gemini-only system.
      throw geminiError;
    }
  }
};
