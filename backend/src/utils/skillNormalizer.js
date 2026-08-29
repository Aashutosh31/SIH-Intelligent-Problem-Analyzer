const SKILL_ALIASES = new Map([
  ["react", "React"],
  ["reactjs", "React"],
  ["react.js", "React"],

  ["node", "Node.js"],
  ["nodejs", "Node.js"],
  ["node.js", "Node.js"],

  ["express", "Express"],
  ["expressjs", "Express"],
  ["express.js", "Express"],

  ["mongodb", "MongoDB"],
  ["mongo", "MongoDB"],
  ["mongoose", "Mongoose"],

  ["javascript", "JavaScript"],
  ["js", "JavaScript"],

  ["typescript", "TypeScript"],
  ["ts", "TypeScript"],

  ["python", "Python"],
  ["py", "Python"],

  ["c++", "C++"],
  ["cpp", "C++"],

  ["c#", "C#"],
  ["csharp", "C#"],

  ["java", "Java"],

  ["docker", "Docker"],
  ["kubernetes", "Kubernetes"],
  ["k8s", "Kubernetes"],

  ["aws", "AWS"],
  ["amazon web services", "AWS"],

  ["gcp", "Google Cloud"],
  ["google cloud", "Google Cloud"],

  ["azure", "Azure"],
  ["microsoft azure", "Azure"],

  ["machine learning", "Machine Learning"],
  ["ml", "Machine Learning"],

  ["deep learning", "Deep Learning"],
  ["dl", "Deep Learning"],

  ["artificial intelligence", "Artificial Intelligence"],
  ["ai", "Artificial Intelligence"],

  ["computer vision", "Computer Vision"],
  ["cv", "Computer Vision"],

  ["nlp", "Natural Language Processing"],
  ["natural language processing", "Natural Language Processing"],

  ["tensorflow", "TensorFlow"],
  ["pytorch", "PyTorch"],

  ["git", "Git"],
  ["github", "GitHub"],

  ["figma", "Figma"],
  ["ui ux", "UI/UX"],
  ["ui/ux", "UI/UX"],
  ["ux", "UX"],
  ["ui", "UI"],
]);

const normalizeKey = (skill) =>
  skill
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const normalizeSkill = (skill) => {
  if (typeof skill !== "string") {
    return "";
  }

  const cleaned = normalizeKey(skill);

  if (!cleaned) {
    return "";
  }

  return (
    SKILL_ALIASES.get(cleaned) ||
    skill.trim()
  );
};

export const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  const normalized = skills
    .map(normalizeSkill)
    .filter(Boolean);

  return [...new Map(
    normalized.map((skill) => [
      skill.toLowerCase(),
      skill,
    ])
  ).values()];
};