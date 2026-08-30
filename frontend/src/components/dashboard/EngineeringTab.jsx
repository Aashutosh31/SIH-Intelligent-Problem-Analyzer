import { CheckCircle, ChevronRight } from "lucide-react";

import ExecutionOwnership from "./ExecutionOwnership";

const EngineeringTab = ({ engineering, taskAllocation }) => {
  if (!engineering) return null;

  return (
    <div className="space-y-8">
      {/* What it actually means section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <CheckCircle size={18} className="mr-2 text-green-400" />
          What This Actually Means
        </h3>
        <ul className="space-y-3">
          {engineering.whatItActuallyMeans.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800"
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
        <h3 className="text-lg font-semibold text-white mb-3">
          System Architecture
        </h3>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4 font-mono text-sm text-blue-300 text-center">
          Pattern: {engineering.architecturePattern}
        </div>

        <div className="grid gap-3">
          {engineering.components.map((comp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium text-slate-200">{comp.name}</p>
                <p className="text-xs text-slate-400">{comp.description}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  comp.complexity === "High"
                    ? "bg-red-500/20 text-red-400"
                    : comp.complexity === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                }`}
              >
                {comp.complexity} Complexity
              </span>
            </div>
          ))}
        </div>
      </div>
      <ExecutionOwnership taskAllocation={taskAllocation} />{" "}
    </div>
  );
};

export default EngineeringTab;
