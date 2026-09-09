import { Code, Server, BrainCircuit, Database } from "lucide-react";

import SkillGapPanel from "./SkillGapPanel";

const SkillsTab = ({ teamAndSkills, techStack, skillGapRecommendations }) => {
  if (!teamAndSkills || !techStack) return null;

  const requiredSkills = Array.isArray(teamAndSkills.requiredSkills)
    ? teamAndSkills.requiredSkills
    : Array.isArray(teamAndSkills.mustHave)
      ? teamAndSkills.mustHave.map((skill) => ({
          skill,
          importance: "Must Have",
          weight: 0,
          reason: "",
        }))
      : [];

  const goodToHaveSkills = Array.isArray(teamAndSkills.goodToHave)
    ? teamAndSkills.goodToHave
    : [];

  const safeTechStack = {
    frontend: Array.isArray(techStack.frontend) ? techStack.frontend : [],
    backend: Array.isArray(techStack.backend) ? techStack.backend : [],
    ai_ml: Array.isArray(techStack.ai_ml) ? techStack.ai_ml : [],
    database: Array.isArray(techStack.database) ? techStack.database : [],
  };

  const stackGroups = [
    { key: "frontend", label: "Frontend", icon: Code, color: "text-blue-400", items: safeTechStack.frontend },
    { key: "backend", label: "Backend", icon: Server, color: "text-emerald-400", items: safeTechStack.backend },
    { key: "ai_ml", label: "AI / ML", icon: BrainCircuit, color: "text-purple-400", items: safeTechStack.ai_ml },
    { key: "database", label: "Database", icon: Database, color: "text-amber-400", items: safeTechStack.database },
  ];

  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-white/10 pb-2.5">
            Required Skills
          </h3>
          <ul className="space-y-2.5">
            {requiredSkills.map((item, idx) => {
              const skillName = typeof item === "string" ? item : item.skill;
              const importance =
                typeof item === "string" ? "Must Have" : item.importance;

              return (
                <li
                  key={idx}
                  className="text-sm flex items-center text-slate-300"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2.5 shrink-0"></span>
                  <span>
                    {skillName}
                    {importance && importance !== "Must Have"
                      ? ` (${importance})`
                      : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-white/10 pb-2.5">
            Good To Have
          </h3>
          <ul className="space-y-2.5">
            {goodToHaveSkills.map((skill, idx) => (
              <li
                key={idx}
                className="text-sm flex items-center text-slate-300"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2.5 shrink-0"></span>
                {typeof skill === "string" ? skill : skill.skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Tech Stack Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white tracking-tight mb-4">
          Recommended Tech Stack
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stackGroups.map((group) => (
            <div
              key={group.key}
              className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4 rounded-xl border border-white/10"
            >
              <group.icon size={18} className={`${group.color} mb-3`} />
              <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.items.map((t, i) => (
                  <div key={i} className="text-sm text-slate-300">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SkillGapPanel skillGapRecommendations={skillGapRecommendations} />
    </div>
  );
};

export default SkillsTab;