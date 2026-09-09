const ScoreGauge = ({ label, score, inverseColor = false }) => {
  // Color logic based on score and whether higher is better/worse
  let color = "bg-emerald-500";
  let glow = "shadow-[0_0_12px_rgba(16,185,129,0.5)]";

  if (inverseColor) {
    if (score > 40) {
      color = "bg-amber-500";
      glow = "shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    }
    if (score > 75) {
      color = "bg-red-500";
      glow = "shadow-[0_0_12px_rgba(239,68,68,0.5)]";
    }
  } else {
    if (score < 40) {
      color = "bg-red-500";
      glow = "shadow-[0_0_12px_rgba(239,68,68,0.5)]";
    } else if (score < 75) {
      color = "bg-amber-500";
      glow = "shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    }
  }

  // Derive text color from the background color class
  const textColor = color.replace("bg-", "text-");

  return (
    <div className="group bg-white/[0.02] p-4 rounded-xl border border-white/10 hover:border-white/15 hover:bg-white/[0.03] transition-colors">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>
          {score}
          <span className="text-slate-600 font-medium">/100</span>
        </span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} ${glow} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreGauge;