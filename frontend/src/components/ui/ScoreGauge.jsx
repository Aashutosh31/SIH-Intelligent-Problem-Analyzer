const ScoreGauge = ({ label, score, inverseColor = false }) => {
  let color = "bg-emerald-500";
  if (inverseColor) {
    if (score > 40) color = "bg-amber-500";
    if (score > 75) color = "bg-red-500";
  } else {
    if (score < 40) color = "bg-red-500";
    else if (score < 75) color = "bg-amber-500";
  }
  const textColor = color.replace("bg-", "text-");
  const shadowColor = color.replace("bg-", "").split("-")[0];

  return (
    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:bg-zinc-900/60 transition-colors">
      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span className={`text-xl tracking-tight font-bold ${textColor}`}>{score}<span className="text-xs text-zinc-600 font-normal">/100</span></span>
      </div>
      <div className="w-full bg-black/50 rounded-full h-1.5 relative z-10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ 
            width: `${score}%`,
            boxShadow: `0 0 10px var(--tw-color-${shadowColor}-500)`
          }}
        />
      </div>
    </div>
  );
};

export default ScoreGauge;
