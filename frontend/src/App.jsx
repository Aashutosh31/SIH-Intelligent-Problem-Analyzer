import { useEffect, useState } from "react";

import {
  Layers,
  Target,
  Loader2,
  BrainCircuit,
  Cpu,
  TrendingUp,
  Server,
  Users,
  ShieldAlert,
  Code2,
  ArrowLeft,
} from "lucide-react";

import { MOCK_TEAM_PROFILE } from "./utils/mockData";

import Header from "./components/layout/Header";

import ScorecardTab from "./components/dashboard/ScorecardTab";
import EngineeringTab from "./components/dashboard/EngineeringTab";
import SkillsTab from "./components/dashboard/SkillsTab";
import AiVibeTab from "./components/dashboard/AiVibeTab";
import VerdictTab from "./components/dashboard/VerdictTab";

import TeamProfileForm from "./components/team/TeamProfileForm";

import { analyzeProblem } from "./services/analysisService";

import { fetchTeamProfile } from "./services/teamProfileService";
import { getTeamId } from "./utils/teamIdentity";

const TabButton = ({
  id,
  icon: Icon,
  label,
  activeTab,
  setActiveTab,
}) => (
  <button
    type="button"
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
  const [inputText, setInputText] = useState(
    "Develop an intelligent platform for monitoring and detecting deepfakes in real-time across social media networks..."
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("scorecard");

  const [activeView, setActiveView] = useState("analyzer");

  const [teamName, setTeamName] = useState(
    MOCK_TEAM_PROFILE.name
  );

  useEffect(() => {
    const loadTeamName = async () => {
      try {
        const profile = await fetchTeamProfile(
          getTeamId()
        );

        if (profile?.name) {
          setTeamName(profile.name);
        }
      } catch (error) {
        // A missing profile is normal before the user
        // creates one. Keep the fallback name.
        if (
          error instanceof Error &&
          error.message !== "Team profile not found."
        ) {
          console.error(
            "Failed to load team profile:",
            error
          );
        }
      }
    };

    loadTeamName();
  }, []);

  const handleAnalyze = async () => {
    const problemStatement = inputText.trim();

    if (!problemStatement || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setError("");
    setActiveTab("scorecard");
    setActiveView("analyzer");

    try {
      const result = await analyzeProblem(
        problemStatement
      );

      setAnalysis(result);
    } catch (error) {
      console.error("Problem analysis failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the problem."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTeamProfileSaved = (savedProfile) => {
    if (savedProfile?.name) {
      setTeamName(savedProfile.name);
    }

    setActiveView("analyzer");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Header
        teamName={teamName}
        onTeamProfileClick={() =>
          setActiveView("team-profile")
        }
      />

      {activeView === "team-profile" ? (
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveView("analyzer")}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Analyzer
            </button>
          </div>

          <TeamProfileForm
            onSaved={handleTeamProfileSaved}
            onCancel={() => setActiveView("analyzer")}
          />
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <Target
                  size={18}
                  className="mr-2 text-blue-400"
                />
                Analyze Problem
              </h2>

              <p className="text-sm text-slate-400 mb-4">
                Paste your Smart India Hackathon problem statement
                here. We'll extract the engineering reality.
              </p>

              <textarea
                className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4 font-mono placeholder:text-slate-600"
                placeholder="Paste problem description, requirements, or upload PDF (coming soon)..."
                value={inputText}
                onChange={(event) =>
                  setInputText(event.target.value)
                }
              />

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing || !inputText.trim()
                }
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin mr-2"
                    />
                    Analyzing Specs...
                  </>
                ) : (
                  <>
                    <BrainCircuit
                      size={18}
                      className="mr-2"
                    />
                    Generate Execution Plan
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={18}
                    className="text-red-400 mt-0.5 flex-shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-red-300">
                      Analysis failed
                    </p>

                    <p className="text-sm text-red-200/80 mt-1 break-words">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!analysis &&
              !isAnalyzing &&
              !error && (
                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-6 text-center text-slate-500">
                  <Layers
                    size={32}
                    className="mx-auto mb-3 opacity-50"
                  />

                  <p className="text-sm">
                    Enter a problem statement to generate
                    architecture, risk analysis, and team fit
                    scores.
                  </p>
                </div>
              )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <Loader2
                  size={48}
                  className="animate-spin text-blue-500"
                />

                <p className="animate-pulse font-medium">
                  Deconstructing problem requirements...
                </p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                <div className="flex overflow-x-auto border-b border-slate-800 hide-scrollbar">
                  <TabButton
                    id="scorecard"
                    icon={TrendingUp}
                    label="Scorecard"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  <TabButton
                    id="engineering"
                    icon={Server}
                    label="Engineering Plan"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  <TabButton
                    id="skills"
                    icon={Users}
                    label="Team & Stack"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  <TabButton
                    id="ai"
                    icon={Code2}
                    label="AI & Vibe Coding"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  <TabButton
                    id="risks"
                    icon={ShieldAlert}
                    label="Verdict & Risks"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-b-xl rounded-tr-xl p-6 min-h-[400px]">
                  {activeTab === "scorecard" && (
                  <ScorecardTab
                    scorecard={analysis.scorecard}
                    teamFit={analysis.teamFit}
                  />
                  )}

                  {activeTab === "engineering" && (
                    <EngineeringTab
                      engineering={
                        analysis.engineeringInterpretation
                      }
                    />
                  )}

                  {activeTab === "skills" && (
                    <SkillsTab
                      teamAndSkills={
                        analysis.teamAndSkills
                      }
                      techStack={analysis.techStack}
                    />
                  )}

                  {activeTab === "ai" && (
                    <AiVibeTab
                      aiAndVibeCoding={
                        analysis.aiAndVibeCoding
                      }
                      aiVibePotential={
                        analysis.scorecard
                          .aiVibePotential
                      }
                    />
                  )}

                  {activeTab === "risks" && (
                    <VerdictTab
                      verdict={analysis.verdict}
                      risks={analysis.risks}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}