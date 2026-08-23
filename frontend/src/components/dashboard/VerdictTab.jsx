import { ShieldAlert } from 'lucide-react';

const VerdictTab = ({ verdict, risks }) => {
  if (!verdict || !risks) return null;

  // Determine styling based on the decision
  const isGo = verdict.decision.includes("GO");
  const isConsider = verdict.decision.includes("CONSIDER");

  const bannerBg = isGo ? "bg-green-900/20 border-green-800" :
                   isConsider ? "bg-yellow-900/20 border-yellow-800" :
                   "bg-red-900/20 border-red-800";

  const bannerText = isGo ? "text-green-400" :
                     isConsider ? "text-yellow-400" :
                     "text-red-400";

  return (
    <div className="space-y-6">
      {/* Final Verdict Banner */}
      <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center ${bannerBg}`}>
        <h2 className={`text-3xl font-black tracking-tight mb-3 ${bannerText}`}>
          {verdict.decision}
        </h2>
        <p className="text-sm max-w-2xl text-slate-300 leading-relaxed">
          {verdict.reasoning}
        </p>
      </div>

      {/* Project Killers (Red Flags) */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 mt-8 flex items-center">
          <ShieldAlert size={18} className="mr-2 text-red-500" />
          Project Killers (Red Flags)
        </h3>
        <div className="space-y-3">
          {risks.redFlags.map((flag, idx) => {
            const severityColor = flag.severity === 'Critical' ? 'bg-red-500' :
                                  flag.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500';
            
            const textColor = flag.severity === 'Critical' ? 'text-red-400' :
                              flag.severity === 'High' ? 'text-orange-400' : 'text-yellow-400';

            return (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start">
                <div className={`mt-0.5 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${severityColor}`}></div>
                <div>
                  <p className="text-sm text-slate-200">{flag.risk}</p>
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