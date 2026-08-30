import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

const getRequirementRows = (teamFit) => {
  const matched = (teamFit?.matchedSkills || []).map(
    (skill) => ({
      ...skill,
      status: "strong",
    }),
  );

  const partial = (teamFit?.partialMatches || []).map(
    (skill) => ({
      ...skill,
      status: "partial",
    }),
  );

  const missing = (teamFit?.missingSkills || []).map(
    (skill) => ({
      ...skill,
      status: "missing",
      proficiency: null,
      coverage: 0,
      primaryOwner: null,
      supportingMembers: [],
      contributingMembers: [],
      memberCount: 0,
      isSinglePointOfFailure: false,
    }),
  );

  return [
    ...matched,
    ...partial,
    ...missing,
  ].sort((a, b) => {
    const criticalA =
      a.importance === "Must Have" ||
      a.weight >= 8;

    const criticalB =
      b.importance === "Must Have" ||
      b.weight >= 8;

    if (criticalA !== criticalB) {
      return criticalA ? -1 : 1;
    }

    return b.weight - a.weight;
  });
};

const getStatusConfig = (status) => {
  switch (status) {
    case "strong":
      return {
        label: "Strong",
        className:
          "border-emerald-900/60 bg-emerald-950/30 text-emerald-400",
        icon: CheckCircle2,
      };

    case "partial":
      return {
        label: "Partial",
        className:
          "border-amber-900/60 bg-amber-950/30 text-amber-400",
        icon: AlertTriangle,
      };

    default:
      return {
        label: "Missing",
        className:
          "border-red-900/60 bg-red-950/30 text-red-400",
        icon: CircleDashed,
      };
  }
};

const TeamCoverageMatrix = ({ teamFit }) => {
  const rows = getRequirementRows(teamFit);

  if (!rows.length) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Team Coverage Matrix
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Requirement-by-requirement view of capability,
              ownership, and coverage risk.
            </p>
          </div>

          <span className="text-xs text-slate-500 shrink-0">
            {rows.length} requirements
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Requirement
              </th>

              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Importance
              </th>

              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Owner
              </th>

              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Proficiency
              </th>

              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Coverage
              </th>

              <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const status =
                getStatusConfig(row.status);

              const StatusIcon = status.icon;

              const isCritical =
                row.importance === "Must Have" ||
                row.weight >= 8;

              return (
                <tr
                  key={`${row.canonicalSkill || row.skill}-${row.weight}`}
                  className="border-b border-slate-800/70 last:border-b-0 hover:bg-slate-900/40 transition-colors"
                >
                  {/* Requirement */}
                  <td className="px-4 py-4 align-top">
                    <div className="max-w-sm">
                      <p className="text-sm font-medium text-slate-200">
                        {row.skill}
                      </p>

                      {row.canonicalSkill &&
                        row.canonicalSkill !==
                          row.skill && (
                          <p className="text-[10px] text-slate-600 mt-1">
                            Match key:{" "}
                            {row.canonicalSkill}
                          </p>
                        )}

                      <p className="text-xs text-slate-500 mt-1">
                        {row.reason}
                      </p>
                    </div>
                  </td>

                  {/* Importance */}
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <span
                        className={`text-[10px] font-semibold ${
                          isCritical
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {row.importance}
                      </span>

                      <p className="text-[10px] text-slate-600">
                        Weight {row.weight}/10
                      </p>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-4 align-top">
                    {row.primaryOwner ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-300">
                          {row.primaryOwner.memberName}
                        </p>

                        {row.supportingMembers?.length >
                          0 && (
                          <p className="text-[10px] text-slate-500">
                            +{" "}
                            {row.supportingMembers
                              .map(
                                (member) =>
                                  member.memberName,
                              )
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">
                        No owner
                      </span>
                    )}
                  </td>

                  {/* Proficiency */}
                  <td className="px-4 py-4 align-top">
                    {row.proficiency ? (
                      <div className="min-w-20">
                        <span className="text-xs font-semibold text-slate-300">
                          {row.proficiency}/10
                        </span>

                        <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.status === "strong"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${
                                row.proficiency * 10
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Coverage */}
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-300">
                        {row.coverage}/{row.weight}
                      </span>

                      {row.memberCount > 0 && (
                        <p className="text-[10px] text-slate-600">
                          {row.memberCount} contributor
                          {row.memberCount !== 1
                            ? "s"
                            : ""}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium ${status.className}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>

                      {row.isSinglePointOfFailure &&
                        row.status !== "missing" && (
                          <p className="text-[10px] text-amber-400">
                            Single owner
                          </p>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-800">
        {rows.map((row) => {
          const status =
            getStatusConfig(row.status);

          const StatusIcon = status.icon;

          return (
            <div
              key={`${row.canonicalSkill || row.skill}-${row.weight}`}
              className="p-4 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    {row.skill}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {row.reason}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium shrink-0 ${status.className}`}
                >
                  <StatusIcon size={11} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">
                    Owner
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {row.primaryOwner?.memberName ||
                      "No owner"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">
                    Importance
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {row.importance}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">
                    Proficiency
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {row.proficiency
                      ? `${row.proficiency}/10`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">
                    Coverage
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    {row.coverage}/{row.weight}
                  </p>
                </div>
              </div>

              {row.supportingMembers?.length >
                0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600">
                    Supporting members
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {row.supportingMembers
                      .map(
                        (member) =>
                          member.memberName,
                      )
                      .join(", ")}
                  </p>
                </div>
              )}

              {row.isSinglePointOfFailure &&
                row.status !== "missing" && (
                <p className="text-[10px] text-amber-400">
                  Single point of failure
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamCoverageMatrix;