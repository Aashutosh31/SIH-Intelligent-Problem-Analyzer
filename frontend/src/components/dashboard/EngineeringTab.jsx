import { CheckCircle, ChevronRight } from "lucide-react";

import ExecutionOwnership from "./ExecutionOwnership";

const EngineeringTab = ({ engineering, taskAllocation }) => {
  if (!engineering) return null;
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-white mb-4 flex items-center">
          <CheckCircle size={18} className="mr-2 text-emerald-400" />
          What This Actually Means
        </h3>
        <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 space-y-1 shadow-xl">
          {engineering.whatItActuallyMeans.map((item, idx) => (
            <div key={idx} className="flex items-start p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
              <ChevronRight size={16} className="mr-3 mt-0.5 text-blue-500 shrink-0" />
              <p className="text-sm text-zinc-300 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight text-white mb-4">System Architecture</h3>
        <div className="bg-[#111] border border-white/10 rounded-t-2xl p-4 flex items-center justify-between border-b-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]"></div>
          <div className="flex space-x-2 relative z-10">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="text-xs font-mono text-zinc-400 relative z-10 bg-black px-3 py-1 rounded-full border border-white/10 shadow-sm">
            Pattern: <span className="text-blue-400">{engineering.architecturePattern}</span>
          </div>
          <div className="w-16"></div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-b-2xl p-5 grid gap-3 shadow-2xl">
          {engineering.components.map((comp, idx) => (
            <div key={idx} className="flex items-center justify-between bg-zinc-900/30 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
              <div>
                <p className="font-medium text-zinc-200">{comp.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{comp.description}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold border ${
                comp.complexity === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                comp.complexity === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
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
