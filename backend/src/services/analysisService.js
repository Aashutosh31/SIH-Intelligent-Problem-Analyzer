const generateMockAnalysis = (problemStatement) => {
  return {
    identity: {
      title: "AI-Driven Problem Analysis",
      domain: "Smart India Hackathon",
      coreProblem:
        "The submitted problem statement needs to be translated into a concrete engineering system with clear requirements, architecture, risks, and implementation strategy.",
    },

    scorecard: {
      difficulty: 72,
      competition: 68,
      innovation: 76,
      teamFit: 65,
      aiVibePotential: 82,
      implementationRisk: 61,
    },

    engineeringInterpretation: {
      whatItActuallyMeans: [
        "Extract the real-world objective hidden inside the problem statement.",
        "Identify the required users, inputs, processing pipeline, and outputs.",
        "Break the solution into frontend, backend, data, AI/ML, infrastructure, and integration components.",
        "Define an architecture that is realistic for an SIH prototype.",
        `Base the analysis on the submitted statement: "${problemStatement.slice(
          0,
          300
        )}${problemStatement.length > 300 ? "..." : ""}"`,
      ],

      components: [
        {
          name: "Frontend Application",
          description:
            "User-facing interface for submitting the problem and consuming the generated analysis.",
          complexity: "Medium",
        },
        {
          name: "Backend API",
          description:
            "Orchestrates analysis requests, validation, provider calls, and structured responses.",
          complexity: "Medium",
        },
        {
          name: "Analysis Engine",
          description:
            "Transforms the raw problem statement into structured engineering intelligence.",
          complexity: "High",
        },
        {
          name: "Persistence Layer",
          description:
            "Stores analyses, team profiles, and future comparison history.",
          complexity: "Medium",
        },
      ],

      architecturePattern: "Modular Monolith + LLM Service Layer",
    },

    techStack: {
      frontend: ["React", "Vite", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      ai_ml: ["LLM Provider Abstraction", "Gemini"],
      database: ["MongoDB", "Mongoose"],
    },

    teamAndSkills: {
      mustHave: [
        "Full-stack development",
        "REST API development",
        "LLM/API integration",
        "Database fundamentals",
      ],
      goodToHave: [
        "AI/ML fundamentals",
        "Cloud deployment",
        "DevOps",
        "UI/UX",
      ],
      recommendedComposition:
        "2–4 members covering frontend, backend/AI integration, and product/domain understanding.",
    },

    aiAndVibeCoding: {
      opportunities: [
        "Generate frontend boilerplate and reusable components.",
        "Generate REST API boilerplate and validation logic.",
        "Generate tests and documentation.",
        "Assist with database schemas and integration code.",
        "Help refactor repetitive code and investigate errors.",
      ],
      dangerZones: [
        "Do not blindly trust AI-generated authentication or authorization logic.",
        "Do not blindly trust score calculations without validation.",
        "Do not accept research claims without evidence.",
        "Do not expose API keys or secrets in generated code.",
        "Human review is required for architectural and security-critical decisions.",
      ],
      toolStack: [
        "Gemini",
        "GitHub Copilot",
        "ChatGPT",
        "Claude",
      ],
    },

    risks: {
      redFlags: [
        {
          risk: "LLM-generated scores may become arbitrary without an explainable scoring model.",
          severity: "High",
        },
        {
          risk: "Current competitor, pricing, and student-benefit information requires external research.",
          severity: "High",
        },
        {
          risk: "The quality of the final recommendation depends heavily on problem interpretation.",
          severity: "Medium",
        },
      ],
      datasetRisk:
        "Not applicable to the initial prototype; depends on the specific SIH problem when AI/ML requirements are detected.",
    },

    verdict: {
      decision: "GO FOR IT - BUT...",
      reasoning:
        "The problem should be evaluated further using real evidence, team capabilities, implementation constraints, and current competition before making a final selection.",
    },
  };
};

export const analyzeProblem = async (problemStatement) => {
  // This is intentionally mocked for the API-contract phase.
  // Gemini integration will replace this implementation later.
  return generateMockAnalysis(problemStatement);
};