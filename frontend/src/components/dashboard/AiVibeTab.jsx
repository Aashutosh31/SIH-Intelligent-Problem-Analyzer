import { CheckCircle, AlertTriangle } from 'lucide-react';

const AiVibeTab = ({ aiAndVibeCoding, aiVibePotential }) => {
  if (!aiAndVibeCoding) return null;

  return (
    <div className="space-y-6">
      {/* AI Potential Score Header */}
      <div className="relative overflow-hidden flex items-center justify-between p-5 sm:p-6 bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <h3 className="font-semibold text-blue-300 tracking-tight">AI Acceleration Potential</h3>
          <p className="text-sm text-slate-400 mt-1">How much of this can AI code for you?</p>
        </div>
        <div className="relative text-4xl font-black text-white tabular-nums">
          {aiVibePotential}
          <span className="text-lg text-blue-400">%</span>
        </div>
      </div>

      {/* Safe vs Danger Zones Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Safe Zone */}
        <div className="bg-white/[0.02] p-5 rounded-2xl border border-emerald-500/20">
          <h4 className="font-medium text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle size={16} /> Safe to Vibe Code
          </h4>
          <ul className="space-y-3">
            {aiAndVibeCoding.opportunities.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start leading-relaxed">
                <span className="text-emerald-500/60 mr-2">—</span> {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-white/[0.02] p-5 rounded-2xl border border-red-500/20">
          <h4 className="font-medium text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> Do NOT Trust AI Here
          </h4>
          <ul className="space-y-3">
            {aiAndVibeCoding.dangerZones.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start leading-relaxed">
                <span className="text-red-500/60 mr-2">—</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiVibeTab;