const ScoreGauge = ({ label, score, inverseColor = false }) => {
  // Color logic based on score and whether higher is better/worse
  let color = "bg-green-500";
  
  if (inverseColor) {
    if (score > 40) color = "bg-yellow-500";
    if (score > 75) color = "bg-red-500";
  } else {
    if (score < 40) color = "bg-red-500";
    else if (score < 75) color = "bg-yellow-500";
  }

  // Derive text color from the background color class
  const textColor = color.replace('bg-', 'text-');

  return (
    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {score}/100
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

export default ScoreGauge;