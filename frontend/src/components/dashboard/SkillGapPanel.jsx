import {
  AlertTriangle,
  BrainCircuit,
  GraduationCap,
  UserRound,
} from "lucide-react";

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "Critical": return "border-red-500/20 bg-red-500/10 text-red-400";
    case "High": return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    default: return "border-white/10 bg-zinc-900 text-zinc-400";
  }
};

const getDifficultyClasses = (difficulty) => {
  switch (difficulty) {
    case "Low": return "text-emerald-400";
    case "Medium": return "text-amber-400";
    default: return "text-red-400";
  }
};

const SkillGapPanel = ({ skillGapRecommendations }) => {
  if (!skillGapRecommendations) return null;
  const { recommendations = [], unresolvedGaps = [], totalGaps = 0, criticalGaps = 0 } = skillGapRecommendations;

  if (totalGaps === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-3">
        <BrainCircuit size={18} className="text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-emerald-200">Skill Gap Intelligence</h3>
          <p className="text-xs text-emerald-400/70 mt-1">No significant learning gaps were identified for this problem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight text-white">Skill Gap Intelligence</h3>
        </div>
        <p className="text-sm text-zinc-500 mt-1">Recommended learning paths for capabilities your team currently lacks.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Total gaps</p>
          <p className="text-3xl font-light tracking-tight text-white">{totalGaps}</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><AlertTriangle size={64}/></div>
          <p className="text-[10px] uppercase tracking-widest text-red-500/70 font-semibold mb-1 relative z-10">Critical gaps</p>
          <p className="text-3xl font-light tracking-tight text-red-400 relative z-10">{criticalGaps}</p>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={`${rec.canonicalSkill}-${idx}`} className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{rec.skill}</p>
                  {rec.canonicalSkill && rec.canonicalSkill !== rec.skill && (
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">match: {rec.canonicalSkill}</p>
                  )}
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium shrink-0 ${getPriorityClasses(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              <div className="p-5 space-y-5">
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 flex items-start gap-3">
                  <UserRound size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Recommended learner</p>
                    <p className="text-sm font-medium text-zinc-200 mt-1">{rec.recommendedLearner?.memberName || "Unknown"}</p>
                    {rec.recommendedLearner?.role && <p className="text-xs text-zinc-500 mt-1">{rec.recommendedLearner.role}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Learning gap</p>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">{rec.currentProficiency}/10 → {rec.targetProficiency}/10</p>
                    </div>
                    <span className="text-xs font-medium text-amber-400">Gap {rec.proficiencyGap}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${Math.min(100, (rec.currentProficiency / 10) * 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap size={14} className={getDifficultyClasses(rec.difficulty)} />
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Difficulty</span>
                    </div>
                    <p className={`text-sm font-medium ${getDifficultyClasses(rec.difficulty)}`}>{rec.difficulty}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Confidence</p>
                    <p className="text-sm font-medium text-zinc-200">{rec.confidence}/100</p>
                  </div>
                </div>
                {rec.relatedSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Existing foundation</p>
                    <div className="space-y-2">
                      {rec.relatedSkills.map((skill, sIdx) => (
                        <div key={`${skill.name}-${sIdx}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                          <span className="text-xs text-zinc-300">{skill.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-zinc-500">{Math.round(Number(skill.relevance || 0) * 100)}% relevant</span>
                            <span className="text-xs font-medium text-zinc-300 font-mono">{skill.proficiency}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rec.reasoning && (
                  <div className="border-l-2 border-zinc-700 pl-4 py-1">
                    <p className="text-xs text-zinc-400 leading-relaxed">{rec.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {unresolvedGaps.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-200">Unresolved Skill Gaps</h4>
              <p className="text-xs text-red-400/60 mt-1">No strong learning candidate identified.</p>
            </div>
          </div>
          <div className="space-y-2">
            {unresolvedGaps.map((gap, idx) => (
              <div key={`${gap.canonicalSkill}-${idx}`} className="rounded-xl border border-red-500/10 bg-black/40 p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{gap.skill}</p>
                  <p className="text-xs text-zinc-500 mt-1">{gap.recommendation}</p>
                </div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-red-400 shrink-0">{gap.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapPanel;
