// Fallback tests: Gemini (primary) -> Groq (fallback) -> error.
//
// Uses node:test + dependency injection. No live Gemini/Groq calls.
// A dummy GEMINI_API_KEY is set before importing the orchestrator because
// geminiProvider.js throws at import time without one (existing behavior).

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

process.env.GEMINI_API_KEY ??= "test-dummy-gemini-key";

const { generateAnalysisContent } = await import("./analysisProvider.js");
const {
  isTransientProviderError,
  isAuthenticationError,
} = await import("./providerErrors.js");
const { normalizeGeminiAnalysis } = await import("./analysisNormalizer.js");
const {
  generateGroqContent,
  isGroqConfigured,
} = await import("./groqProvider.js");

// dotenv (loaded via the provider chain) may have populated real keys.
// Capture them once so tests can mutate env freely and restore it after.
const SAVED_GEMINI_KEY = process.env.GEMINI_API_KEY;
const SAVED_GROQ_KEY = process.env.GROQ_API_KEY;

const restoreKeys = () => {
  if (SAVED_GEMINI_KEY === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = SAVED_GEMINI_KEY;
  if (SAVED_GROQ_KEY === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = SAVED_GROQ_KEY;
};

const FAKE_GEMINI_KEY = "test-dummy-gemini-key";
const FAKE_GROQ_KEY = "test-dummy-groq-key";

const transientError = (status = 503) =>
  Object.assign(new Error(`Provider failed with status ${status}.`), {
    status,
  });

const timeoutError = () =>
  Object.assign(new Error("Gemini request timed out."), {
    name: "GeminiTimeoutError",
    status: 504,
  });

// Minimal raw analysis in the documented prompt schema (what EITHER
// provider must produce for the shared normalizer).
const rawAnalysisFixture = () => ({
  problem_summary: "Build a real-time deepfake detector.",
  scores: {
    overall_difficulty: 80,
    competition_level: 70,
    innovation_potential: 60,
    preliminary_team_fit: 50,
    ai_vibe_coding_potential: 75,
    implementation_risk: 65,
  },
  engineering_interpretation: {
    core_objective: "Detect deepfakes",
    users: ["moderators"],
    inputs: ["video"],
    outputs: ["verdict"],
    key_processing_steps: ["ingest"],
    core_components: ["api"],
    external_dependencies: [],
    ai_ml_requirements: ["classification"],
    hardware_requirements: [],
    infrastructure_requirements: [],
  },
  recommended_architecture: { pattern: "Modular monolith", breakdown: "API + workers." },
  tech_stack: {
    frontend: ["React"],
    backend: ["Node"],
    ai_ml: ["PyTorch"],
    database: ["Postgres"],
    devops_cloud: [],
    reasons: [],
  },
  required_skills: [
    {
      skill: "Computer Vision (PyTorch)",
      canonicalSkill: "Computer Vision",
      importance: "Must Have",
      weight: 10,
      reason: "Core capability.",
    },
  ],
  ai_vibe_coding: {
    high_leverage_areas: ["CRUD"],
    human_validation_required: ["model eval"],
  },
  risks_and_challenges: {
    technical_risks: ["latency"],
    operational_risks: ["abuse"],
  },
  verdict_and_strategy: {
    verdict: "GO FOR IT",
    rationale: "Strong fit.",
    winning_differentiation_strategy: "Speed.",
  },
});

const EXPECTED_ANALYSIS_KEYS = [
  "identity",
  "scorecard",
  "engineeringInterpretation",
  "techStack",
  "teamAndSkills",
  "aiAndVibeCoding",
  "risks",
  "verdict",
];

describe("generateAnalysisContent fallback", () => {
  it("1. Gemini succeeds -> Groq is NOT called", async () => {
    let groqCalls = 0;
    const result = await generateAnalysisContent(
      { prompt: "p", systemInstruction: "s" },
      {
        generateGeminiContent: async () => ({ text: '{"ok":true}' }),
        generateGroqContent: async () => {
          groqCalls += 1;
          return { text: "{}" };
        },
        groqConfigured: true,
      }
    );

    assert.equal(result.provider, "gemini");
    assert.equal(result.text, '{"ok":true}');
    assert.equal(groqCalls, 0);
  });

  it("2. Gemini transient failure (503) -> Groq is called", async () => {
    let groqCalls = 0;
    const result = await generateAnalysisContent(
      { prompt: "p", systemInstruction: "s" },
      {
        generateGeminiContent: async () => {
          throw transientError(503);
        },
        generateGroqContent: async () => {
          groqCalls += 1;
          return { text: '{"ok":true}' };
        },
        groqConfigured: true,
      }
    );

    assert.equal(groqCalls, 1);
    assert.equal(result.provider, "groq");
  });

  it("3. Gemini timeout -> Groq fallback occurs", async () => {
    let groqCalls = 0;
    const result = await generateAnalysisContent(
      { prompt: "p", systemInstruction: "s" },
      {
        generateGeminiContent: async () => {
          throw timeoutError();
        },
        generateGroqContent: async () => {
          groqCalls += 1;
          return { text: '{"ok":true}' };
        },
        groqConfigured: true,
      }
    );

    assert.equal(groqCalls, 1);
    assert.equal(result.provider, "groq");
  });

  it("4. Gemini 429 rate limit -> Groq fallback occurs", async () => {
    const result = await generateAnalysisContent(
      { prompt: "p", systemInstruction: "s" },
      {
        generateGeminiContent: async () => {
          throw transientError(429);
        },
        generateGroqContent: async () => ({ text: '{"ok":true}' }),
        groqConfigured: true,
      }
    );

    assert.equal(result.provider, "groq");
  });

  it("5. Gemini auth failure (401, our own credentials) -> Groq NOT used", async () => {
    let groqCalls = 0;
    const authError = Object.assign(new Error("Invalid Gemini API key."), {
      status: 401,
    });

    await assert.rejects(
      generateAnalysisContent(
        { prompt: "p", systemInstruction: "s" },
        {
          generateGeminiContent: async () => {
            throw authError;
          },
          generateGroqContent: async () => {
            groqCalls += 1;
            return { text: "{}" };
          },
          groqConfigured: true,
        }
      ),
      (err) => err === authError
    );
    assert.equal(groqCalls, 0);
  });

  it("5b. Gemini client error (400, bad input) -> Groq NOT used", async () => {
    let groqCalls = 0;
    await assert.rejects(
      generateAnalysisContent(
        { prompt: "p", systemInstruction: "s" },
        {
          generateGeminiContent: async () => {
            throw transientError(400);
          },
          generateGroqContent: async () => {
            groqCalls += 1;
            return { text: "{}" };
          },
          groqConfigured: true,
        }
      ),
      /status 400/
    );
    assert.equal(groqCalls, 0);
  });

  it("6. Groq success -> same normalized analysis shape as Gemini path", async () => {
    const groqText = JSON.stringify(rawAnalysisFixture());
    const result = await generateAnalysisContent(
      { prompt: "p", systemInstruction: "s" },
      {
        generateGeminiContent: async () => {
          throw transientError(503);
        },
        generateGroqContent: async () => ({ text: groqText }),
        groqConfigured: true,
      }
    );

    // Same shared pipeline the Gemini path uses: JSON.parse + normalizer.
    const normalized = normalizeGeminiAnalysis(JSON.parse(result.text));

    for (const key of EXPECTED_ANALYSIS_KEYS) {
      assert.ok(
        normalized[key] !== undefined,
        `normalized analysis missing key: ${key}`
      );
    }
    assert.equal(normalized.identity.coreProblem, rawAnalysisFixture().problem_summary);
  });

  it("7. Both providers fail -> original Gemini error propagates", async () => {
    const geminiError = transientError(503);
    const groqError = transientError(500);

    await assert.rejects(
      generateAnalysisContent(
        { prompt: "p", systemInstruction: "s" },
        {
          generateGeminiContent: async () => {
            throw geminiError;
          },
          generateGroqContent: async () => {
            throw groqError;
          },
          groqConfigured: true,
        }
      ),
      (err) => err === geminiError
    );
  });

  it("8. GROQ_API_KEY missing -> Gemini-only behavior", async () => {
    let groqCalls = 0;
    const geminiError = transientError(503);

    await assert.rejects(
      generateAnalysisContent(
        { prompt: "p", systemInstruction: "s" },
        {
          generateGeminiContent: async () => {
            throw geminiError;
          },
          generateGroqContent: async () => {
            groqCalls += 1;
            return { text: "{}" };
          },
          groqConfigured: false,
        }
      ),
      (err) => err === geminiError
    );
    assert.equal(groqCalls, 0);
  });

  it("9. Groq malformed output is rejected, never accepted as analysis", () => {
    // The orchestrator returns provider text; the shared pipeline parses
    // it. Malformed text must throw here, exactly as on the Gemini path.
    assert.throws(() => JSON.parse("this is not json{{{"));
    assert.throws(
      () => normalizeGeminiAnalysis({ unexpected: "shape" }),
      /invalid|unsupported/i
    );
  });

  it("9b. Groq empty content -> safe provider failure", async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "   " } }] }),
    });

    try {
      process.env.GROQ_API_KEY = FAKE_GROQ_KEY;
      await assert.rejects(
        generateGroqContent({ prompt: "p", systemInstruction: "s" }),
        /empty response/
      );
    } finally {
      globalThis.fetch = realFetch;
      restoreKeys();
    }
  });

  it("10. No API key appears in logs or thrown errors", async () => {
    const logged = [];
    const origWarn = console.warn;
    const origError = console.error;
    console.warn = (...args) => logged.push(args.join(" "));
    console.error = (...args) => logged.push(args.join(" "));

    try {
      process.env.GEMINI_API_KEY = FAKE_GEMINI_KEY;
      process.env.GROQ_API_KEY = FAKE_GROQ_KEY;

      await assert.rejects(
        generateAnalysisContent(
          { prompt: "problem statement", systemInstruction: "s" },
          {
            generateGeminiContent: async () => {
              throw transientError(503);
            },
            generateGroqContent: async () => {
              throw transientError(500);
            },
            groqConfigured: true,
          }
        )
      );

      const combined = logged.join("\n");
      assert.ok(!combined.includes(FAKE_GEMINI_KEY), "gemini key leaked in logs");
      assert.ok(!combined.includes(FAKE_GROQ_KEY), "groq key leaked in logs");
      assert.ok(!combined.includes("problem statement"), "prompt leaked in logs");
    } finally {
      console.warn = origWarn;
      console.error = origError;
      restoreKeys();
    }
  });
});

describe("providerErrors classification", () => {
  it("transient: 429/500/502/503/504, timeouts, network failures", () => {
    for (const status of [429, 500, 502, 503, 504]) {
      assert.equal(isTransientProviderError(transientError(status)), true);
    }
    assert.equal(isTransientProviderError(timeoutError()), true);
    assert.equal(
      isTransientProviderError(
        Object.assign(new Error("Groq request timed out."), {
          name: "GroqTimeoutError",
          status: 504,
        })
      ),
      true
    );
    assert.equal(
      isTransientProviderError(
        Object.assign(new Error("fetch failed"), { cause: { code: "ECONNREFUSED" } })
      ),
      true
    );
  });

  it("non-transient: auth, client errors, programmer errors, not-configured", () => {
    assert.equal(isTransientProviderError(Object.assign(new Error("x"), { status: 401 })), false);
    assert.equal(isAuthenticationError(Object.assign(new Error("x"), { status: 403 })), true);
    assert.equal(isTransientProviderError(Object.assign(new Error("x"), { status: 400 })), false);
    assert.equal(isTransientProviderError(new Error("plain programmer error")), false);
    assert.equal(
      isTransientProviderError(
        Object.assign(new Error("no key"), { code: "PROVIDER_NOT_CONFIGURED", status: 500 })
      ),
      false
    );
  });
});

describe("groqProvider configuration", () => {
  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  afterEach(() => {
    restoreKeys();
  });

  it("unconfigured: isGroqConfigured() false, call throws without network", async () => {
    assert.equal(isGroqConfigured(), false);

    const realFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = async (...args) => {
      fetchCalls += 1;
      return realFetch(...args);
    };

    try {
      await assert.rejects(
        generateGroqContent({ prompt: "p", systemInstruction: "s" }),
        (err) => err.code === "PROVIDER_NOT_CONFIGURED"
      );
      assert.equal(fetchCalls, 0);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("transient Groq status is retried (bounded), permanent 4xx is not", async () => {
    process.env.GROQ_API_KEY = FAKE_GROQ_KEY;
    const realFetch = globalThis.fetch;
    let calls = 0;

    globalThis.fetch = async () => {
      calls += 1;
      if (calls === 1) {
        return { ok: false, status: 503, json: async () => ({}) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
      };
    };

    try {
      const result = await generateGroqContent({
        prompt: "p",
        systemInstruction: "s",
        maxRetries: 1,
      });
      assert.equal(result.text, '{"ok":true}');
      assert.equal(calls, 2);
    } finally {
      globalThis.fetch = realFetch;
    }

    let badCalls = 0;
    globalThis.fetch = async () => {
      badCalls += 1;
      return { ok: false, status: 400, json: async () => ({}) };
    };

    try {
      await assert.rejects(
        generateGroqContent({ prompt: "p", systemInstruction: "s" }),
        /status 400/
      );
      assert.equal(badCalls, 1);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
