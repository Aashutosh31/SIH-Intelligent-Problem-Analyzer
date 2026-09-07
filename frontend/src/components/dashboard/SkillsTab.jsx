import { Code, Server, BrainCircuit, Database } from "lucide-react";

import SkillGapPanel from "./SkillGapPanel";

const SkillsTab = ({ teamAndSkills, techStack, skillGapRecommendations }) => {
  if (!teamAndSkills || !techStack) return null;
  const requiredSkills = Array.isArray(teamAndSkills.requiredSkills) 
    ? teamAndSkills.requiredSkills 
    : Array.isArray(teamAndSkills.mustHave) 
      ? teamAndSkills.mustHave.map(skill => ({ skill, importance: "Must Have", weight: 0, reason: "" })) 
      : [];
      
  const goodToHaveSkills = Array.isArray(teamAndSkills.goodToHave) ? teamAndSkills.goodToHave : [];
  
  const safeTechStack = {
    frontend: Array.isArray(techStack.frontend) ? techStack.frontend : [],
    backend: Array.isArray(techStack.backend) ? techStack.backend : [],
    ai_ml: Array.isArray(techStack.ai_ml) ? techStack.ai_ml : [],
    database: Array.isArray(techStack.database) ? techStack.database : []
  };

  const techCategories = [
    { title: "Frontend", icon: Code, color: "text-blue-400", items: safeTechStack.frontend },
    { title: "Backend", icon: Server, color: "text-emerald-400", items: safeTechStack.backend },
    { title: "AI / ML", icon: BrainCircuit, color: "text-purple-400", items: safeTechStack.ai_ml },
    { title: "Database", icon: Database, color: "text-amber-400", items: safeTechStack.database }
  ];

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Required Skills
          </h3>
          <ul className="space-y-3">
            {requiredSkills.map((item, idx) => {
              const skillName = typeof item === "string" ? item : item.skill;
              const importance = typeof item === "string" ? "Must Have" : item.importance;
              return (
                <li key={idx} className="text-sm text-zinc-300 flex items-center justify-between">
                  <span>{skillName}</span>
                  {importance && importance !== "Must Have" && <span className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-900 px-2 py-0.5 rounded">{importance}</span>}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Good To Have
          </h3>
          <ul className="space-y-3">
            {goodToHaveSkills.map((skill, idx) => (
              <li key={idx} className="text-sm text-zinc-300">
                {typeof skill === "string" ? skill : skill.skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight text-white mb-5">Recommended Tech Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techCategories.map((cat, i) => (
            <div key={i} className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors shadow-xl">
              <cat.icon size={20} className={`${cat.color} mb-3`} />
              <h4 className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">{cat.title}</h4>
              <div className="space-y-2">
                {cat.items.map((t, j) => (
                  <div key={j} className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-1.5 rounded border border-white/5 truncate">
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
