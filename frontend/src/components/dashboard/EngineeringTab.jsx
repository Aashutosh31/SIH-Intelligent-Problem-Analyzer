import { CheckCircle, ChevronRight } from "lucide-react";

import ExecutionOwnership from "./ExecutionOwnership";

const EngineeringTab = ({ engineering, taskAllocation }) => {
  if (!engineering) return null;

  return (
    <div className="space-y-8">
      {/* What it actually means section */}
      <div>
        <h3 className="text-lg font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={14} className="text-emerald-400" />
          </span>
          What This Actually Means
        </h3>
        <ul className="space-y-2.5">
          {engineering.whatItActuallyMeans.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start text-sm text-slate-300 bg-white/[0.02] hover:bg-white/[0.03] transition-colors p-3.5 rounded-xl border border-white/10 leading-relaxed"
            >
              <ChevronRight
                size={16}
                className="mr-2 mt-0.5 text-blue-400 shrink-0"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* System Architecture Section */}
      <div>
        <h3 className="text-lg font-semibold text-white tracking-tight mb-4">
          System Architecture
        </h3>
        <div className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4 font-mono text-sm text-blue-300 text-center">
          <span className="text-slate-600 mr-2">Pattern:</span>
          {engineering.architecturePattern}
        </div>

        <div className="grid gap-3">
          {engineering.components.map((comp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-xl border border-white/10"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-200">{comp.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{comp.description}</p>
              </div>
              <span
                className={`shrink-0 text-xs px-2.5 py-1 rounded-lg font-medium border ${
                  comp.complexity === "High"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : comp.complexity === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {comp.complexity} Complexity
              </span>
            </div>
          ))}
        </div>
      </div>

      <ExecutionOwnership taskAllocation={taskAllocation} />
    </div>
  );
};

export default EngineeringTab;