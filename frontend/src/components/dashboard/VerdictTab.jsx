import { ShieldAlert } from 'lucide-react';

const VerdictTab = ({ verdict, risks }) => {
  if (!verdict || !risks) return null;

  // Determine styling based on the decision
  const isGo = verdict.decision.includes("GO");
  const isConsider = verdict.decision.includes("CONSIDER");

  const bannerBg = isGo ? "bg-emerald-500/[0.07] border-emerald-500/20" :
                   isConsider ? "bg-amber-500/[0.07] border-amber-500/20" :
                   "bg-red-500/[0.07] border-red-500/20";

  const bannerText = isGo ? "text-emerald-400" :
                     isConsider ? "text-amber-400" :
                     "text-red-400";

  const bannerGlow = isGo ? "shadow-[0_0_60px_rgba(16,185,129,0.12)]" :
                     isConsider ? "shadow-[0_0_60px_rgba(245,158,11,0.12)]" :
                     "shadow-[0_0_60px_rgba(239,68,68,0.12)]";

  return (
    <div className="space-y-8">
      {/* Final Verdict Banner */}
      <div className={`relative overflow-hidden p-8 sm:p-10 rounded-2xl border flex flex-col items-center justify-center text-center ${bannerBg} ${bannerGlow}`}>
        <span className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-3 ${bannerText} opacity-70`}>
          Final Verdict
        </span>
        <h2 className={`text-4xl sm:text-5xl font-black tracking-tight mb-4 ${bannerText}`}>
          {verdict.decision}
        </h2>
        <p className="text-sm max-w-2xl text-slate-400 leading-relaxed">
          {verdict.reasoning}
        </p>
      </div>

      {/* Project Killers (Red Flags) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <ShieldAlert size={14} className="text-red-400" />
          </span>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Project Killers (Red Flags)
          </h3>
        </div>
        <div className="space-y-3">
          {risks.redFlags.map((flag, idx) => {
            const severityColor = flag.severity === 'Critical' ? 'bg-red-500' :
                                  flag.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500';
            
            const textColor = flag.severity === 'Critical' ? 'text-red-400' :
                              flag.severity === 'High' ? 'text-orange-400' : 'text-yellow-400';

            return (
              <div key={idx} className="bg-white/[0.02] hover:bg-white/[0.03] transition-colors p-4 rounded-xl border border-white/10 flex items-start">
                <div className={`mt-1.5 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${severityColor}`}></div>
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed">{flag.risk}</p>
                  <span className={`text-xs mt-2 inline-block font-medium ${textColor}`}>
                    {flag.severity} Severity
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerdictTab;