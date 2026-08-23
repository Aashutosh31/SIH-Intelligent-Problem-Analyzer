import { Code, Server, BrainCircuit, Database } from 'lucide-react';

const SkillsTab = ({ teamAndSkills, techStack }) => {
  if (!teamAndSkills || !techStack) return null;

  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-2">
            Must Have Skills
          </h3>
          <ul className="space-y-2">
            {teamAndSkills.mustHave.map((skill, idx) => (
              <li key={idx} className="text-sm flex items-center text-slate-300">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-2">
            Good To Have
          </h3>
          <ul className="space-y-2">
            {teamAndSkills.goodToHave.map((skill, idx) => (
              <li key={idx} className="text-sm flex items-center text-slate-300">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Tech Stack Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Tech Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <Code size={20} className="text-blue-400 mb-2" />
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Frontend</h4>
            {techStack.frontend.map((t, i) => <div key={i} className="text-sm text-slate-300">{t}</div>)}
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <Server size={20} className="text-green-400 mb-2" />
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Backend</h4>
            {techStack.backend.map((t, i) => <div key={i} className="text-sm text-slate-300">{t}</div>)}
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <BrainCircuit size={20} className="text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">AI / ML</h4>
            {techStack.ai_ml.map((t, i) => <div key={i} className="text-sm text-slate-300">{t}</div>)}
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <Database size={20} className="text-yellow-400 mb-2" />
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Database</h4>
            {techStack.database.map((t, i) => <div key={i} className="text-sm text-slate-300">{t}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsTab;