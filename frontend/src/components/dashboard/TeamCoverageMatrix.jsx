import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";

const TeamCoverageMatrix = ({ teamFit }) => {
  const getRequirementRows = (teamFit) => {
    const matched = (teamFit?.matchedSkills || []).map(s => ({ ...s, status: "strong" }));
    const partial = (teamFit?.partialMatches || []).map(s => ({ ...s, status: "partial" }));
    const missing = (teamFit?.missingSkills || []).map(s => ({
      ...s, status: "missing", proficiency: null, coverage: 0, primaryOwner: null, supportingMembers: [], contributingMembers: [], memberCount: 0, isSinglePointOfFailure: false
    }));
    return [...matched, ...partial, ...missing].sort((a, b) => {
      const critA = a.importance === "Must Have" || a.weight >= 8;
      const critB = b.importance === "Must Have" || b.weight >= 8;
      if (critA !== critB) return critA ? -1 : 1;
      return b.weight - a.weight;
    });
  };

  const rows = getRequirementRows(teamFit);
  if (!rows.length) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case "strong": return { label: "Strong", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 };
      case "partial": return { label: "Partial", className: "border-amber-500/20 bg-amber-500/10 text-amber-400", icon: AlertTriangle };
      default: return { label: "Missing", className: "border-red-500/20 bg-red-500/10 text-red-400", icon: CircleDashed };
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl">
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Team Coverage Matrix</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Requirement-by-requirement view of capability, ownership, and risk.</p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-black px-2 py-1 rounded border border-white/5">{rows.length} reqs</span>
      </div>
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/40">
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Requirement</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Importance</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Owner</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Proficiency</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Coverage</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => {
              const status = getStatusConfig(row.status);
              const StatusIcon = status.icon;
              const isCritical = row.importance === "Must Have" || row.weight >= 8;
              return (
                <tr key={`${row.canonicalSkill || row.skill}-${row.weight}`} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm font-medium text-zinc-200">{row.skill}</p>
                    {row.canonicalSkill && row.canonicalSkill !== row.skill && (
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">Match: {row.canonicalSkill}</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">{row.reason}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${isCritical ? "text-red-400" : "text-zinc-500"}`}>{row.importance}</span>
                    <p className="text-[10px] text-zinc-600 mt-1 font-mono">wt: {row.weight}/10</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {row.primaryOwner ? (
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{row.primaryOwner.memberName}</p>
                        {row.supportingMembers?.length > 0 && (
                          <p className="text-[10px] text-zinc-600 mt-1">+ {row.supportingMembers.map(m => m.memberName).join(", ")}</p>
                        )}
                      </div>
                    ) : <span className="text-xs text-zinc-600 italic">No owner</span>}
                  </td>
                  <td className="px-5 py-4 align-top">
                    {row.proficiency ? (
                      <div className="w-20">
                        <span className="text-xs font-mono font-medium text-zinc-300">{row.proficiency}/10</span>
                        <div className="mt-2 h-1 rounded-full bg-zinc-900 overflow-hidden">
                          <div className={`h-full rounded-full ${row.status === "strong" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${row.proficiency * 10}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-xs text-zinc-700">—</span>}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="text-xs font-semibold text-zinc-300 font-mono">{row.coverage}/{row.weight}</span>
                    {row.memberCount > 0 && <p className="text-[10px] text-zinc-600 mt-1">{row.memberCount} contributor{row.memberCount !== 1 ? 's' : ''}</p>}
                  </td>
                  <td className="px-5 py-4 align-top space-y-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${status.className}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                    {row.isSinglePointOfFailure && row.status !== "missing" && (
                      <p className="text-[10px] text-amber-500/70 mt-1">Single owner</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamCoverageMatrix;
