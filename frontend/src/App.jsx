import  { useState } from 'react';
import {
  Layers, Target, Loader2, BrainCircuit, Cpu,
  TrendingUp, Server, Users, ShieldAlert,
  Code2
} from 'lucide-react';

// Import extracted mock data
import { MOCK_ANALYSIS_RESULT, MOCK_TEAM_PROFILE } from './utils/mockData';

// Import layout and UI
import Header from './components/layout/Header';

// Import dashboard tabs
import ScorecardTab from './components/dashboard/ScorecardTab';
import EngineeringTab from './components/dashboard/EngineeringTab';
import SkillsTab from './components/dashboard/SkillsTab';
import AiVibeTab from './components/dashboard/AiVibeTab';
import VerdictTab from './components/dashboard/VerdictTab';

// FIX: Moved TabButton outside the main App component
const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 ${
      activeTab === id 
        ? "border-blue-500 text-blue-400 bg-slate-800" 
        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
    }`}
  >
    <Icon size={16} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("scorecard");

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    
    // Simulate API call and LLM processing delay
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS_RESULT);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Header teamName={MOCK_TEAM_PROFILE.name} />

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Target size={18} className="mr-2 text-blue-400" />
              Analyze Problem
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Paste your Smart India Hackathon problem statement here. We'll extract the engineering reality.
            </p>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4 font-mono placeholder:text-slate-600"
              placeholder="Paste problem description, requirements, or upload PDF (coming soon)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              defaultValue="Develop an intelligent platform for monitoring and detecting deepfakes in real-time across social media networks..."
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <><Loader2 size={18} className="animate-spin mr-2" /> Analyzing Specs...</>
              ) : (
                <><BrainCircuit size={18} className="mr-2" /> Generate Execution Plan</>
              )}
            </button>
          </div>

          {!analysis && !isAnalyzing && (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500">
              <Layers size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Enter a problem statement to generate architecture, risk analysis, and team fit scores.</p>
            </div>
          )}
        </div>

        {/* Right Column: Dashboard / Results */}
        <div className="lg:col-span-8">
          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <Loader2 size={48} className="animate-spin text-blue-500" />
              <p className="animate-pulse font-medium">Deconstructing problem requirements...</p>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Cpu size={120} />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 block">
                      {analysis.identity.domain}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {analysis.identity.title}
                    </h2>
                  </div>
                </div>
                <p className="text-slate-300 text-sm border-l-2 border-slate-700 pl-4 relative z-10">
                  {analysis.identity.coreProblem}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto border-b border-slate-800 hide-scrollbar">
                <TabButton id="scorecard" icon={TrendingUp} label="Scorecard" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="engineering" icon={Server} label="Engineering Plan" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="skills" icon={Users} label="Team & Stack" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="ai" icon={Code2} label="AI & Vibe Coding" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="risks" icon={ShieldAlert} label="Verdict & Risks" activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>

              {/* Tab Content Area */}
              <div className="bg-slate-900 border border-slate-800 rounded-b-xl rounded-tr-xl p-6 min-h-[400px]">
                {activeTab === "scorecard" && <ScorecardTab scorecard={analysis.scorecard} />}
                {activeTab === "engineering" && <EngineeringTab engineering={analysis.engineeringInterpretation} />}
                {activeTab === "skills" && <SkillsTab teamAndSkills={analysis.teamAndSkills} techStack={analysis.techStack} />}
                {activeTab === "ai" && <AiVibeTab aiAndVibeCoding={analysis.aiAndVibeCoding} aiVibePotential={analysis.scorecard.aiVibePotential} />}
                {activeTab === "risks" && <VerdictTab verdict={analysis.verdict} risks={analysis.risks} />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}