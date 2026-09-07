import {
  AlertTriangle,
  CheckCircle2,
  UserRound,
} from "lucide-react";

const ExecutionOwnership = ({ taskAllocation }) => {
  if (!taskAllocation) return null;
  const { memberAllocations = [], unassignedRequirements = [], bottlenecks = [], singleOwnerRisks = [] } = taskAllocation;
  
  const hasNoAllocationData = !memberAllocations.length && !unassignedRequirements.length && !bottlenecks.length && !singleOwnerRisks.length;

  if (hasNoAllocationData) {
    return (
      <div className="mt-8 rounded-2xl border border-white/5 bg-zinc-900/30 p-5 flex items-start gap-3">
        <UserRound size={18} className="text-zinc-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Execution Ownership</h3>
          <p className="text-xs text-zinc-500 mt-1">No team ownership data is available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight text-white">Execution Ownership</h3>
        </div>
        <p className="text-sm text-zinc-500 mt-1">Deterministic assignment of problem capabilities to team members.</p>
      </div>

      {memberAllocations.length > 0 && (
        <div className="space-y-4">
          {memberAllocations.map((member) => (
            <div key={member.memberId || member.memberName} className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium text-white">{member.memberName}</h4>
                  {member.role && <p className="text-xs text-zinc-500 mt-1">{member.role}</p>}
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0 bg-zinc-900 px-2 py-1 rounded-md border border-white/5">
                  {member.assignments.length} assignments
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {member.assignments.map((assignment, idx) => (
                  <div key={`${assignment.canonicalSkill}-${idx}`} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200">{assignment.skill}</p>
                        {assignment.canonicalSkill && assignment.canonicalSkill !== assignment.skill && (
                            <p className="text-[10px] text-zinc-600 mt-1 font-mono">Match: {assignment.canonicalSkill}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{assignment.reason}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${assignment.importance === "Must Have" ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-white/10 bg-zinc-900 text-zinc-400"}`}>
                        {assignment.importance}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{assignment.proficiency}/10 prof.</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">Primary: <span className="text-zinc-200">{assignment.primaryOwner?.memberName || member.memberName}</span></span>
                    </div>
                    {assignment.supportingMembers?.length > 0 && (
                      <div className="mt-3 rounded-xl border border-white/5 bg-zinc-900/40 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Supporting members</p>
                        <p className="text-xs text-zinc-400">
                          {assignment.supportingMembers.map(m => `${m.memberName} (${m.proficiency}/10)`).join(", ")}
                        </p>
                      </div>
                    )}
                    {assignment.isSinglePointOfFailure && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-fit">
                        <AlertTriangle size={13} /> Only one team member covers this capability.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {bottlenecks.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={16} />
                <h4 className="text-sm font-medium">Critical Bottlenecks</h4>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">{bottlenecks.length}</span>
            </div>
            <div className="space-y-2">
              {bottlenecks.map((b, idx) => (
                <div key={`${b.canonicalSkill}-${idx}`} className="rounded-xl border border-red-500/10 bg-black/40 p-3">
                  <p className="text-sm font-medium text-zinc-200">{b.skill}</p>
                  <p className="text-xs text-red-400/70 mt-1">{b.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {singleOwnerRisks.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={16} />
                <h4 className="text-sm font-medium">Single-Owner Risks</h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">{singleOwnerRisks.length}</span>
            </div>
            <div className="space-y-2">
              {singleOwnerRisks.map((risk, idx) => (
                <div key={`${risk.canonicalSkill}-${idx}`} className="rounded-xl border border-amber-500/10 bg-black/40 p-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-medium text-zinc-200">{risk.skill}</p>
                    <span className="shrink-0 text-xs font-mono text-amber-400">{risk.proficiency}/10</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <CheckCircle2 size={12} /> Owner: <span className="text-zinc-300">{risk.primaryOwner?.memberName || "Unknown"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {unassignedRequirements.length > bottlenecks.length && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Unassigned Requirements</h4>
              <p className="text-xs text-zinc-500 mt-1">Capabilities not currently owned.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-400">{unassignedRequirements.length}</span>
          </div>
          <div className="space-y-2">
            {unassignedRequirements
              .filter(req => !bottlenecks.some(b => b.canonicalSkill === req.canonicalSkill))
              .map((req, idx) => (
                <div key={`${req.canonicalSkill}-${idx}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-black/40 p-3">
                  <span className="text-xs text-zinc-300">{req.skill}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">Unassigned</span>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionOwnership;
