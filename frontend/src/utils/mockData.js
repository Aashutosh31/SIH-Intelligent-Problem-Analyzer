export const MOCK_ANALYSIS_RESULT = {
  identity: {
    title: "AI-Driven Deepfake Detection System for Social Media",
    domain: "Cybersecurity & Media",
    coreProblem: "Government needs a scalable API to detect manipulated video/audio content on social platforms in near real-time."
  },
  scorecard: {
    difficulty: 85,
    competition: 90,
    innovation: 70,
    teamFit: 65,
    aiVibePotential: 40,
    implementationRisk: 88
  },
  engineeringInterpretation: {
    whatItActuallyMeans: [
      "1. Build a high-throughput video ingestion pipeline capable of chunking large files.",
      "2. Implement a queuing system (e.g., Redis/RabbitMQ) to handle async processing.",
      "3. Deploy a multi-modal ML architecture (CNNs for frame analysis, audio spectrogram analysis).",
      "4. Expose results via a low-latency REST or GraphQL API for client integration.",
      "5. Provide a dashboard for analysts to review flagged content with bounding boxes/timestamps."
    ],
    components: [
      { name: "Video Ingestion API", description: "Handles multipart uploads and rate limiting.", complexity: "Medium" },
      { name: "Async Task Worker", description: "Pulls video chunks from queue, runs inference.", complexity: "High" },
      { name: "Inference Engine", description: "GPU-accelerated Python microservice running PyTorch.", complexity: "High" },
      { name: "Analyst Dashboard", description: "React SPA for viewing results and managing API keys.", complexity: "Low" }
    ],
    architecturePattern: "Event-Driven Microservices with GPU-Worker Nodes"
  },
  techStack: {
    frontend: ["React", "Tailwind CSS", "Video.js"],
    backend: ["FastAPI (Python)", "Node.js (API Gateway)", "Redis (Queue)"],
    ai_ml: ["PyTorch", "OpenCV", "HuggingFace Transformers"],
    database: ["PostgreSQL", "AWS S3 / MinIO (Object Storage)"]
  },
  teamAndSkills: {
    mustHave: ["Python", "Machine Learning (CV/Audio)", "System Design"],
    goodToHave: ["Docker/DevOps", "React", "WebSockets"],
    recommendedComposition: "1x ML Engineer, 1x Backend/Data Engineer, 1x Full-Stack Developer"
  },
  aiAndVibeCoding: {
    opportunities: [
      "Frontend dashboard generation (React components, charts, tables).",
      "API Gateway boilerplate and CRUD endpoints.",
      "Dockerfiles and basic CI/CD pipeline generation."
    ],
    dangerZones: [
      "Core deepfake detection models (AI cannot generate novel SOTA architectures reliably).",
      "Queue management and memory optimization for large video files.",
      "Security and API key management logic."
    ],
    toolStack: ["Cursor/Windsurf for UI", "Google Colab (Free GPU) for training", "GitHub Copilot for boilerplate"]
  },
  risks: {
    redFlags: [
      { risk: "Dataset Availability: High-quality, diverse deepfake datasets are massive and often proprietary.", severity: "Critical" },
      { risk: "Compute Costs: Real-time video inference requires expensive GPUs. Cannot run on free-tier cloud.", severity: "Critical" },
      { risk: "Latency constraints: Processing video is slow; meeting 'real-time' requirements is extremely difficult.", severity: "High" }
    ]
  },
  verdict: {
    decision: "AVOID",
    reasoning: "While the problem is high-impact, the combination of extreme compute costs (GPU required), massive dataset requirements, and the team's low hardware/ML infrastructure experience makes this a high-risk failure point for a 36-hour hackathon."
  }
};

export const MOCK_TEAM_PROFILE = {
  name: "Team Syntax Error",
  strengths: ["MERN Stack", "UI/UX", "Basic Python"],
  weaknesses: ["Deep Learning", "Hardware", "Complex DevOps"]
};