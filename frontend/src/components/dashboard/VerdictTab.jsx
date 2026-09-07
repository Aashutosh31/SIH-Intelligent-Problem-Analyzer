import { ShieldAlert } from 'lucide-react';

const VerdictTab = ({ verdict, risks }) => {
  if (!verdict || !risks) return null;
  const isGo = verdict.decision.includes("GO");
  const isConsider = verdict.decision.includes("CONSIDER");
  
  const bannerBg = isGo ? "bg-emerald-500/10 border-emerald-500/30" : isConsider ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30";
  const bannerText = isGo ? "text-emerald-400" : isConsider ? "text-amber-400" : "text-red-400";
  const shadowColor = isGo ? "rgba(16,185,129,0.2)" : isConsider ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)";

  return (
    <div className="space-y-8">
      <div 
        className={`p-10 rounded-3xl border flex flex-col items-center justify-center text-center ${bannerBg} relative overflow-hidden`}
        style={{ boxShadow: `0 0 40px ${shadowColor}` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
        <h2 className={`text-5xl md:text-6xl font-black tracking-tighter mb-4 relative z-10 ${bannerText} drop-shadow-md`}>
          {verdict.decision}
        </h2>
        <p className="text-base max-w-2xl text-zinc-300 leading-relaxed relative z-10">
          {verdict.reasoning}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight text-white mb-5 flex items-center">
          <ShieldAlert size={18} className="mr-2 text-red-500" />
          Project Killers (Red Flags)
        </h3>
        <div className="grid gap-3">
          {risks.redFlags.map((flag, idx) => {
            const isCrit = flag.severity === 'Critical';
            const isHigh = flag.severity === 'High';
            const severityColor = isCrit ? 'bg-red-500' : isHigh ? 'bg-orange-500' : 'bg-yellow-500';
            const textColor = isCrit ? 'text-red-400' : isHigh ? 'text-orange-400' : 'text-yellow-400';
            const borderColor = isCrit ? 'border-red-500/20' : isHigh ? 'border-orange-500/20' : 'border-yellow-500/20';
            const bgClass = isCrit ? 'bg-red-500/5' : isHigh ? 'bg-orange-500/5' : 'bg-yellow-500/5';

            return (
              <div key={idx} className={`p-5 rounded-2xl border ${borderColor} ${bgClass} flex items-start hover:bg-white/[0.02] transition-colors`}>
                <div className={`mt-1.5 w-2 h-2 rounded-full mr-4 flex-shrink-0 shadow-[0_0_8px_currentColor] ${severityColor} text-transparent`}>.</div>
                <div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{flag.risk}</p>
                  <span className={`text-[10px] uppercase tracking-widest mt-3 inline-block font-bold ${textColor}`}>
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
