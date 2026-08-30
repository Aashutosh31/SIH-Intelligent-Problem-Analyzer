import {
  AlertTriangle,
  CheckCircle2,
  UserRound,
} from "lucide-react";

const ExecutionOwnership = ({ taskAllocation }) => {
  if (!taskAllocation) {
    return null;
  }

  const {
    memberAllocations = [],
    unassignedRequirements = [],
    bottlenecks = [],
    singleOwnerRisks = [],
  } = taskAllocation;

  const hasNoAllocationData =
    memberAllocations.length === 0 &&
    unassignedRequirements.length === 0 &&
    bottlenecks.length === 0 &&
    singleOwnerRisks.length === 0;

  if (hasNoAllocationData) {
    return (
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/50 p-5">
        <div className="flex items-start gap-3">
          <UserRound
            size={18}
            className="text-slate-500 mt-0.5 shrink-0"
          />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Execution Ownership
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              No team ownership data is available for this analysis yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {/* Section heading */}
      <div>
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-blue-400" />

          <h3 className="text-lg font-semibold text-white">
            Execution Ownership
          </h3>
        </div>

        <p className="text-sm text-slate-400 mt-1">
          Deterministic assignment of problem capabilities to the strongest
          available team members.
        </p>
      </div>

      {/* Member assignments */}
      {memberAllocations.length > 0 && (
        <div className="space-y-4">
          {memberAllocations.map((member) => (
            <div
              key={member.memberId || member.memberName}
              className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden"
            >
              <div className="px-4 py-4 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {member.memberName}
                    </h4>

                    {member.role && (
                      <p className="text-xs text-slate-500 mt-1">
                        {member.role}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 shrink-0">
                    {member.assignments.length}{" "}
                    {member.assignments.length === 1
                      ? "assignment"
                      : "assignments"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {member.assignments.map((assignment, index) => (
                  <div
                    key={`${assignment.canonicalSkill}-${index}`}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200">
                          {assignment.skill}
                        </p>

                        {assignment.canonicalSkill &&
                          assignment.canonicalSkill !== assignment.skill && (
                            <p className="text-[10px] text-slate-600 mt-1">
                              Match: {assignment.canonicalSkill}
                            </p>
                          )}

                        <p className="text-xs text-slate-500 mt-1">
                          {assignment.reason}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${
                          assignment.importance === "Must Have"
                            ? "border-red-900/60 bg-red-950/30 text-red-400"
                            : "border-slate-800 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {assignment.importance}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-blue-400 font-medium">
                        {assignment.proficiency}/10 proficiency
                      </span>

                      <span className="text-slate-600">•</span>

                      <span className="text-slate-400">
                        {assignment.primaryOwner?.memberName ||
                          member.memberName}{" "}
                        is primary
                      </span>
                    </div>

                    {assignment.supportingMembers?.length > 0 && (
                      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-600">
                          Supporting members
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {assignment.supportingMembers
                            .map((supportingMember) => (
                              `${supportingMember.memberName} (${supportingMember.proficiency}/10)`
                            ))
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {assignment.isSinglePointOfFailure && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-400">
                        <AlertTriangle size={13} />
                        Only one team member currently covers this capability.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-red-400 mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white">
                Critical Bottlenecks
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                High-impact capabilities with no current team owner.
              </p>
            </div>

            <span className="ml-auto shrink-0 text-xs font-semibold text-red-400">
              {bottlenecks.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {bottlenecks.map((bottleneck, index) => (
              <div
                key={`${bottleneck.canonicalSkill}-${index}`}
                className="rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <p className="text-sm font-medium text-slate-200">
                  {bottleneck.skill}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {bottleneck.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned non-critical requirements */}
      {unassignedRequirements.length > bottlenecks.length && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Unassigned Requirements
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                Capabilities not currently owned by a team member.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              {unassignedRequirements.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {unassignedRequirements
              .filter(
                (requirement) =>
                  !bottlenecks.some(
                    (bottleneck) =>
                      bottleneck.canonicalSkill ===
                      requirement.canonicalSkill,
                  ),
              )
              .map((requirement, index) => (
                <div
                  key={`${requirement.canonicalSkill}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3"
                >
                  <span className="text-xs text-slate-300">
                    {requirement.skill}
                  </span>

                  <span className="text-[10px] text-slate-600">
                    Unassigned
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Single owner risks */}
      {singleOwnerRisks.length > 0 && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-amber-400 mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white">
                Single-Owner Risks
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                Capabilities currently dependent on one team member.
              </p>
            </div>

            <span className="ml-auto shrink-0 text-xs font-semibold text-amber-400">
              {singleOwnerRisks.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {singleOwnerRisks.map((risk, index) => (
              <div
                key={`${risk.canonicalSkill}-${index}`}
                className="rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {risk.skill}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {risk.reason}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-amber-400">
                    {risk.proficiency}/10
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                  <CheckCircle2 size={12} className="text-slate-600" />

                  Primary owner:{" "}
                  <span className="text-slate-300">
                    {risk.primaryOwner?.memberName ||
                      "Unknown"}
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

export default ExecutionOwnership;