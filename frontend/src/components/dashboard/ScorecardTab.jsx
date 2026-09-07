import { CheckCircle2, AlertTriangle, Target } from "lucide-react";

import ScoreGauge from "../ui/ScoreGauge";
import TeamCoverageMatrix from "./TeamCoverageMatrix";

const ScorecardTab = ({ scorecard, teamFit }) => {
  if (!scorecard) return null;
  const matchedSkills = teamFit?.matchedSkills || [];
  const criticalGaps = teamFit?.criticalGaps || [];
  const teamResilience = teamFit?.teamResilience ?? 0;

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-white mb-5">Master Scorecard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ScoreGauge label="Difficulty (Technical)" score={scorecard.difficulty} inverseColor={true} />
          <ScoreGauge label="Competition Level" score={scorecard.competition} inverseColor={true} />
          <ScoreGauge label="Innovation Potential" score={scorecard.innovation} />
          <ScoreGauge label="Team Fit (vs. Profile)" score={scorecard.teamFit} />
          <ScoreGauge label="AI/Vibe Coding" score={scorecard.aiVibePotential} />
          <ScoreGauge label="Implementation Risk" score={scorecard.implementationRisk} inverseColor={true} />
        </div>
      </div>

      {teamFit && (
        <div className="border-t border-white/5 pt-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-blue-400" />
                <h3 className="text-lg font-semibold tracking-tight text-white">Team Fit Intelligence</h3>
              </div>
              <p className="text-sm text-zinc-500 mt-1">Deterministic comparison of team skills vs. requirements.</p>
            </div>
            <div className="text-right bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2">
              <div className="text-3xl font-light tracking-tight text-white">
                {teamFit.score}<span className="text-sm font-medium text-zinc-500 ml-1">/100</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                {teamFit.coveredWeight}/{teamFit.totalWeight} Coverage
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Team Resilience</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Multi-member backup for critical tasks.</p>
                </div>
                <div className="text-xl font-medium font-mono text-blue-400">{teamResilience}<span className="text-xs text-zinc-600">/100</span></div>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${teamResilience}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Single-owner</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Multi-member</span>
              </div>
            </div>
            
            {teamFit.summary && (
              <div className={`rounded-2xl border p-5 flex items-start gap-3 ${criticalGaps.length > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                {criticalGaps.length > 0 ? <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />}
                <p className="text-sm text-zinc-300 leading-relaxed">{teamFit.summary}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Critical Skill Gaps</h4>
                  <p className="text-xs text-zinc-500 mt-1">High-impact missing capabilities</p>
                </div>
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{criticalGaps.length}</span>
              </div>
              {criticalGaps.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 size={16} /> No critical gaps.</div>
              ) : (
                <div className="space-y-3">
                  {criticalGaps.map(gap => (
                    <div key={gap.skill} className="rounded-lg bg-black border border-white/5 p-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{gap.skill}</p>
                          <p className="text-xs text-zinc-500 mt-1">{gap.reason}</p>
                        </div>
                        <span className="shrink-0 text-xs font-mono text-red-400">{gap.weight}/10</span>
                      </div>
                      <span className="inline-block text-[10px] text-red-400 mt-2 uppercase tracking-widest">{gap.importance}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Strong Skill Matches</h4>
                  <p className="text-xs text-zinc-500 mt-1">Requirements covered at strong proficiency</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{matchedSkills.length}</span>
              </div>
              {matchedSkills.length === 0 ? (
                 <p className="text-sm text-zinc-500">No strong skill matches yet.</p>
              ) : (
                <div className="space-y-3">
                   {matchedSkills.map(skill => (
                     <div key={skill.skill} className="rounded-lg bg-black border border-white/5 p-3">
                       <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2 min-w-0">
                            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                               <p className="text-sm font-medium text-zinc-200">{skill.skill}</p>
                               <p className="text-xs text-zinc-500 mt-1">{skill.reason}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-mono text-emerald-400">{skill.proficiency}/10</span>
                            <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wider">prof.</p>
                          </div>
                       </div>
                       <div className="mt-3">
                          <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                             <div className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${skill.proficiency * 10}%` }} />
                          </div>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
          <TeamCoverageMatrix teamFit={teamFit} />
        </div>
      )}
    </div>
  );
};

export default ScorecardTab;
