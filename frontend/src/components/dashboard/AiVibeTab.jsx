import { CheckCircle, AlertTriangle } from 'lucide-react';

const AiVibeTab = ({ aiAndVibeCoding, aiVibePotential }) => {
  if (!aiAndVibeCoding) return null;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
        <div className="relative z-10">
          <h3 className="font-semibold text-blue-400 text-lg">AI Acceleration Potential</h3>
          <p className="text-sm text-zinc-400 mt-1">Estimated proportion of codebase safe for Vibe Coding.</p>
        </div>
        <div className="relative z-10 text-5xl font-light tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          {aiVibePotential}<span className="text-2xl text-blue-500/50 ml-1">%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
          <h4 className="font-medium text-emerald-400 mb-5 flex items-center">
            <CheckCircle size={18} className="mr-2" /> Safe to Vibe Code
          </h4>
          <ul className="space-y-4">
            {aiAndVibeCoding.opportunities.map((item, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start leading-relaxed">
                <span className="text-emerald-500/50 mr-3 mt-1">●</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-red-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h4 className="font-medium text-red-400 mb-5 flex items-center relative z-10">
            <AlertTriangle size={18} className="mr-2" /> Do NOT Trust AI Here
          </h4>
          <ul className="space-y-4 relative z-10">
            {aiAndVibeCoding.dangerZones.map((item, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start leading-relaxed">
                <span className="text-red-500/50 mr-3 mt-1">●</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiVibeTab;
