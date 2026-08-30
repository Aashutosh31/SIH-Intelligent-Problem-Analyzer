import { CheckCircle2, AlertTriangle, Target } from "lucide-react";

import ScoreGauge from "../ui/ScoreGauge";
import TeamCoverageMatrix from "./TeamCoverageMatrix";

const ScorecardTab = ({ scorecard, teamFit }) => {
  if (!scorecard) {
    return null;
  }

  const matchedSkills = teamFit?.matchedSkills || [];
  const partialMatches = teamFit?.partialMatches || [];
  const missingSkills = teamFit?.missingSkills || [];
  const criticalGaps = teamFit?.criticalGaps || [];
  const teamResilience = teamFit?.teamResilience ?? 0;

  return (
    <div className="space-y-6">
      {/* Master Scorecard */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Master Scorecard
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ScoreGauge
            label="Difficulty (Technical)"
            score={scorecard.difficulty}
            inverseColor={true}
          />

          <ScoreGauge
            label="Competition Level"
            score={scorecard.competition}
            inverseColor={true}
          />

          <ScoreGauge
            label="Innovation Potential"
            score={scorecard.innovation}
          />

          <ScoreGauge
            label="Team Fit (vs. Team Profile)"
            score={scorecard.teamFit}
          />

          <ScoreGauge
            label="AI/Vibe Coding Potential"
            score={scorecard.aiVibePotential}
          />

          <ScoreGauge
            label="Implementation Risk"
            score={scorecard.implementationRisk}
            inverseColor={true}
          />
        </div>
      </div>

      {/* Team Fit Intelligence */}
      {teamFit && (
        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-blue-400" />

                <h3 className="text-lg font-semibold text-white">
                  Team Fit Intelligence
                </h3>
              </div>

              <p className="text-sm text-slate-400 mt-1">
                Deterministic comparison of your team's skills against this
                problem's requirements.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-white">
                {teamFit.score}
                <span className="text-sm font-medium text-slate-500">/100</span>
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {teamFit.coveredWeight}/{teamFit.totalWeight} weighted coverage
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Team Resilience
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  How well critical capabilities are backed by multiple team
                  members.
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-white">
                  {teamResilience}
                  <span className="text-xs font-medium text-slate-500">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${teamResilience}%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-600">
                Single-owner coverage
              </span>

              <span className="text-[10px] text-slate-500">
                Multi-member coverage
              </span>
            </div>
          </div>

          {/* Summary */}
          {teamFit.summary && (
            <div
              className={`rounded-lg border p-4 mb-5 ${
                criticalGaps.length > 0
                  ? "border-amber-900/60 bg-amber-950/20"
                  : "border-emerald-900/60 bg-emerald-950/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {criticalGaps.length > 0 ? (
                  <AlertTriangle
                    size={18}
                    className="text-amber-400 mt-0.5 shrink-0"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400 mt-0.5 shrink-0"
                  />
                )}

                <p className="text-sm text-slate-300 leading-relaxed">
                  {teamFit.summary}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Critical Gaps */}
            <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Critical Skill Gaps
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    High-impact missing capabilities
                  </p>
                </div>

                <span className="text-xs font-semibold text-red-400">
                  {criticalGaps.length}
                </span>
              </div>

              {criticalGaps.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 size={16} />
                  No critical skill gaps identified.
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalGaps.map((gap) => (
                    <div
                      key={gap.skill}
                      className="rounded-lg bg-slate-950 border border-slate-800 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {gap.skill}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {gap.reason}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-semibold text-red-400">
                          {gap.weight}/10
                        </span>
                      </div>

                      <span className="inline-block text-[11px] text-red-300 mt-2">
                        {gap.importance}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strong Skill Matches */}
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Strong Skill Matches
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Requirements your team covers at strong proficiency
                  </p>
                </div>

                <span className="text-xs font-semibold text-emerald-400">
                  {matchedSkills.length}
                </span>
              </div>

              {matchedSkills.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No strong skill matches yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {matchedSkills.map((skill) => (
                    <div
                      key={skill.skill}
                      className="rounded-lg bg-slate-950 border border-slate-800 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400 mt-0.5 shrink-0"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200">
                              {skill.skill}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {skill.reason}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-xs font-semibold text-emerald-400">
                            {skill.proficiency}/10
                          </span>

                          <p className="text-[10px] text-slate-600 mt-0.5">
                            proficiency
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${skill.proficiency * 10}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-600">
                            Coverage
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {skill.coverage}/{skill.weight}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wide text-slate-600">
                            Primary owner
                          </span>

                          <span className="text-xs text-slate-300">
                            {skill.primaryOwner?.memberName || "Unknown"}
                          </span>
                        </div>

                        {skill.supportingMembers?.length > 0 ? (
                          <div className="mt-1.5 flex items-start justify-between gap-3">
                            <span className="text-[10px] uppercase tracking-wide text-slate-600">
                              Support
                            </span>

                            <span className="text-xs text-slate-400 text-right">
                              {skill.supportingMembers
                                .map((member) => member.memberName)
                                .join(", ")}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wide text-slate-600">
                              Resilience
                            </span>

                            <span className="text-[10px] text-amber-400">
                              Single point of failure
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {partialMatches.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-900/50 bg-amber-950/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Partial Skill Matches
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Your team has some capability, but proficiency is below the
                    strong-match threshold.
                  </p>
                </div>

                <span className="text-xs font-semibold text-amber-400">
                  {partialMatches.length}
                </span>
              </div>

              <div className="space-y-3">
                {partialMatches.map((skill) => (
                  <div
                    key={skill.skill}
                    className="rounded-lg bg-slate-950 border border-slate-800 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <AlertTriangle
                          size={16}
                          className="text-amber-400 mt-0.5 shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200">
                            {skill.skill}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {skill.reason}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-semibold text-amber-400">
                          {skill.proficiency}/10
                        </span>

                        <p className="text-[10px] text-slate-600 mt-0.5">
                          proficiency
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${skill.proficiency * 10}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-600">
                          Requirement weight: {skill.weight}/10
                        </span>

                        <span className="text-[10px] text-slate-500">
                          Coverage: {skill.coverage}/{skill.weight}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wide text-slate-600">
                          Primary owner
                        </span>

                        <span className="text-xs text-slate-300">
                          {skill.primaryOwner?.memberName || "Unknown"}
                        </span>
                      </div>

                      {skill.supportingMembers?.length > 0 ? (
                        <div className="mt-1.5 flex items-start justify-between gap-3">
                          <span className="text-[10px] uppercase tracking-wide text-slate-600">
                            Support
                          </span>

                          <span className="text-xs text-slate-400 text-right">
                            {skill.supportingMembers
                              .map((member) => member.memberName)
                              .join(", ")}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wide text-slate-600">
                            Resilience
                          </span>

                          <span className="text-[10px] text-amber-400">
                            Single point of failure
                          </span>
                        </div>
                      )}
                    </div>

                    {skill.importance === "Must Have" && (
                      <div className="mt-2">
                        <span className="text-[10px] font-medium text-red-400">
                          Must Have
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Other Skill Gaps
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Missing requirements that are not currently classified as
                    critical
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {Math.max(0, missingSkills.length - criticalGaps.length)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {missingSkills
                  .filter(
                    (skill) =>
                      !criticalGaps.some((gap) => gap.skill === skill.skill),
                  )
                  .map((skill) => (
                    <div
                      key={skill.skill}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                    >
                      <AlertTriangle size={14} className="text-amber-400" />

                      <span className="text-xs text-slate-300">
                        {skill.skill}
                      </span>

                      <span className="text-[11px] text-slate-500">
                        {skill.weight}/10
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <TeamCoverageMatrix teamFit={teamFit} />
        </div>
      )}
    </div>
  );
};

export default ScorecardTab;
