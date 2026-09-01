import {
  AlertTriangle,
  BrainCircuit,
  GraduationCap,
  UserRound,
} from "lucide-react";

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "Critical":
      return "border-red-900/60 bg-red-950/30 text-red-400";

    case "High":
      return "border-amber-900/60 bg-amber-950/30 text-amber-400";

    default:
      return "border-slate-800 bg-slate-900 text-slate-400";
  }
};

const getDifficultyClasses = (difficulty) => {
  switch (difficulty) {
    case "Low":
      return "text-emerald-400";

    case "Medium":
      return "text-amber-400";

    default:
      return "text-red-400";
  }
};

const SkillGapPanel = ({ skillGapRecommendations }) => {
  if (!skillGapRecommendations) {
    return null;
  }

  const {
    recommendations = [],
    unresolvedGaps = [],
    totalGaps = 0,
    criticalGaps = 0,
  } = skillGapRecommendations;

  if (totalGaps === 0) {
    return (
      <div className="mt-8 rounded-xl border border-emerald-900/50 bg-emerald-950/10 p-5">
        <div className="flex items-start gap-3">
          <BrainCircuit
            size={18}
            className="text-emerald-400 mt-0.5 shrink-0"
          />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Skill Gap Intelligence
            </h3>

            <p className="text-xs text-emerald-300/80 mt-1">
              No significant learning gaps were identified for this problem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BrainCircuit
            size={18}
            className="text-blue-400"
          />

          <h3 className="text-lg font-semibold text-white">
            Skill Gap Intelligence
          </h3>
        </div>

        <p className="text-sm text-slate-400 mt-1">
          Recommended learning paths for capabilities your team currently lacks
          or does not strongly cover.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Total gaps
          </p>

          <p className="text-xl font-bold text-white mt-1">
            {totalGaps}
          </p>
        </div>

        <div className="rounded-lg border border-red-900/40 bg-red-950/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Critical gaps
          </p>

          <p className="text-xl font-bold text-red-400 mt-1">
            {criticalGaps}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation.canonicalSkill}-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden"
            >
              {/* Requirement header */}
              <div className="px-4 py-4 border-b border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {recommendation.skill}
                    </p>

                    {recommendation.canonicalSkill &&
                      recommendation.canonicalSkill !==
                        recommendation.skill && (
                        <p className="text-[10px] text-slate-600 mt-1">
                          Capability:{" "}
                          {recommendation.canonicalSkill}
                        </p>
                      )}
                  </div>

                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold shrink-0 ${getPriorityClasses(
                      recommendation.priority,
                    )}`}
                  >
                    {recommendation.priority}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Learner */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex items-start gap-3">
                    <UserRound
                      size={16}
                      className="text-blue-400 mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-slate-600">
                        Recommended learner
                      </p>

                      <p className="text-sm font-medium text-slate-200 mt-1">
                        {recommendation.recommendedLearner?.memberName ||
                          "Unknown"}
                      </p>

                      {recommendation.recommendedLearner?.role && (
                        <p className="text-xs text-slate-500 mt-1">
                          {recommendation.recommendedLearner.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proficiency */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-600">
                        Learning gap
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {recommendation.currentProficiency}/10 →{" "}
                        {recommendation.targetProficiency}/10
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-amber-400">
                      Gap {recommendation.proficiencyGap}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (recommendation.currentProficiency / 10) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Difficulty + confidence */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={14}
                        className={getDifficultyClasses(
                          recommendation.difficulty,
                        )}
                      />

                      <span className="text-[10px] uppercase tracking-wide text-slate-600">
                        Difficulty
                      </span>
                    </div>

                    <p
                      className={`text-sm font-semibold mt-1 ${getDifficultyClasses(
                        recommendation.difficulty,
                      )}`}
                    >
                      {recommendation.difficulty}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                      Candidate confidence
                    </p>

                    <p className="text-sm font-semibold text-slate-200 mt-1">
                      {recommendation.confidence}/100
                    </p>
                  </div>
                </div>

                {/* Related foundation */}
                {recommendation.relatedSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-600 mb-2">
                      Existing foundation
                    </p>

                    <div className="space-y-2">
                      {recommendation.relatedSkills.map(
                        (skill, skillIndex) => (
                          <div
                            key={`${skill.name}-${skillIndex}`}
                            className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/30 px-3 py-2"
                          >
                            <span className="text-xs text-slate-300">
                              {skill.name}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-500">
                                {Math.round(
                                  Number(skill.relevance || 0) * 100,
                                )}
                                % relevant
                              </span>

                              <span className="text-xs font-medium text-slate-300">
                                {skill.proficiency}/10
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Reason */}
                {recommendation.reasoning && (
                  <div className="border-l-2 border-slate-700 pl-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {recommendation.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unresolved */}
      {unresolvedGaps.length > 0 && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-red-400 mt-0.5 shrink-0"
            />

            <div>
              <h4 className="text-sm font-semibold text-white">
                Unresolved Skill Gaps
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                No strong learning candidate was identified from the current
                team profile.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {unresolvedGaps.map((gap, index) => (
              <div
                key={`${gap.canonicalSkill}-${index}`}
                className="rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {gap.skill}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {gap.recommendation}
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold text-red-400 shrink-0">
                    {gap.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapPanel;