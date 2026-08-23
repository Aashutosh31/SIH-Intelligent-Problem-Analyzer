import { CheckCircle, AlertTriangle } from 'lucide-react';

const AiVibeTab = ({ aiAndVibeCoding, aiVibePotential }) => {
  if (!aiAndVibeCoding) return null;

  return (
    <div className="space-y-6">
      {/* AI Potential Score Header */}
      <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-400">AI Acceleration Potential</h3>
          <p className="text-sm text-slate-400">How much of this can AI code for you?</p>
        </div>
        <div className="text-3xl font-bold text-blue-300">{aiVibePotential}%</div>
      </div>

      {/* Safe vs Danger Zones Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Safe Zone */}
        <div className="bg-slate-950 p-5 rounded-lg border border-slate-800">
          <h4 className="font-medium text-green-400 mb-4 flex items-center">
            <CheckCircle size={16} className="mr-2" /> Safe to Vibe Code
          </h4>
          <ul className="space-y-3">
            {aiAndVibeCoding.opportunities.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start">
                <span className="text-slate-600 mr-2">-</span> {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-slate-950 p-5 rounded-lg border border-red-900/30">
          <h4 className="font-medium text-red-400 mb-4 flex items-center">
            <AlertTriangle size={16} className="mr-2" /> Do NOT Trust AI Here
          </h4>
          <ul className="space-y-3">
            {aiAndVibeCoding.dangerZones.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start">
                <span className="text-slate-600 mr-2">-</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiVibeTab;