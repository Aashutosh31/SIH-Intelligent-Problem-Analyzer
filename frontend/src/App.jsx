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

import Header from "./components/layout/Header";

import ScorecardTab from "./components/dashboard/ScorecardTab";
import EngineeringTab from "./components/dashboard/EngineeringTab";
import SkillsTab from "./components/dashboard/SkillsTab";
import AiVibeTab from "./components/dashboard/AiVibeTab";
import VerdictTab from "./components/dashboard/VerdictTab";

import TeamProfileForm from "./components/team/TeamProfileForm";

import { analyzeProblem } from "./services/analysisService";

import { fetchTeamProfile, clearAccessToken } from "./services/teamProfileService";
import { getActiveTeamContext } from "./utils/teamIdentity";

const SESSION_EXPIRED_MESSAGE =
  "Your team session is no longer authorized. Please recreate or reconnect the team profile.";

const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    type="button"
    onClick={() => setActiveTab(id)}
    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium whitespace-nowrap ${
      activeTab === id
        ? "bg-[#1a1a1a] text-white shadow-md border border-white/10"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
    }`}
  >
    <Icon size={16} className={activeTab === id ? "text-blue-400" : ""} />
    <span>{label}</span>
  </button>
);

export default function App() {
  const [inputText, setInputText] = useState(
    "Develop an intelligent platform for monitoring and detecting deepfakes in real-time across social media networks...",
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("scorecard");

  const [activeView, setActiveView] = useState("analyzer");

  const [teamName, setTeamName] = useState("No Team Profile");

  const isSessionError = (err) =>
    err instanceof Error &&
    (err.status === 401 || err.status === 403);

  useEffect(() => {
    const loadTeamName = async () => {
      const ctx = getActiveTeamContext();

      if (!ctx) {
        return;
      }

      try {
        const profile = await fetchTeamProfile(ctx.teamId);

        if (profile?.name) {
          setTeamName(profile.name);
        }
      } catch (fetchError) {
        if (
          fetchError instanceof Error &&
          (fetchError.status === 401 || fetchError.status === 403) &&
          fetchError.message !== "Team profile not found."
        ) {
          // The server no longer recognizes this session — fall back to
          // anonymous state instead of leaving the UI permanently stuck.
          setTeamName("No Team Profile");
        } else if (
          fetchError instanceof Error &&
          fetchError.message !== "Team profile not found."
        ) {
          console.error("Failed to load team profile:", fetchError);
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
      // Prefer an actual, saved team session. A locally generated teamId with
      // no access token is NOT a real session — analyze anonymously instead.
      const ctx = getActiveTeamContext();

      const run = (teamContext) =>
        analyzeProblem({
          problemStatement,
          teamId: teamContext?.teamId,
          accessToken: teamContext?.accessToken,
        });

      try {
        const result = await run(ctx);
        setAnalysis(result);
      } catch (err) {
        const isTeamSession =
          ctx &&
          err instanceof Error &&
          (err.status === 401 || err.status === 403);

        if (isTeamSession) {
          // The server rejected this stale/revoked session. Drop it and
          // continue with anonymous analysis rather than staying stuck.
          clearAccessToken(ctx.teamId);

          const result = await run(null);
          setAnalysis(result);
          setError(
            "Your previous team session was no longer valid, so this analysis ran without team context.",
          );
        } else if (
          ctx &&
          err instanceof Error &&
          err.status === 404
        ) {
          // A saved session whose team no longer exists on the server:
          // clear the stale token and analyze anonymously.
          clearAccessToken(ctx.teamId);
          setTeamName("No Team Profile");

          const result = await run(null);
          setAnalysis(result);
          setError(
            "Your saved team no longer exists, so this analysis ran without team context.",
          );
        } else {
          throw err;
        }
      }
    } catch (error) {
      setError(
        isSessionError(error)
          ? SESSION_EXPIRED_MESSAGE
          : error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the problem.",
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
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-blue-500/30 relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <Header
        teamName={teamName}
        onTeamProfileClick={() => setActiveView("team-profile")}
      />

      {activeView === "team-profile" ? (
        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveView("analyzer")}
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Analyzer
            </button>
          </div>
          <TeamProfileForm
            onSaved={handleTeamProfileSaved}
            onCancel={() => setActiveView("analyzer")}
          />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative group">
              <div className="flex items-center px-4 py-3 bg-[#111] border-b border-white/5">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-[10px] font-mono text-zinc-600 flex items-center">
                  <Target size={12} className="mr-2 text-blue-500" /> ~/sih/problem-statement.txt
                </div>
              </div>

              <textarea
                className="w-full h-56 lg:h-72 bg-transparent p-5 text-sm font-mono text-zinc-300 focus:outline-none resize-none placeholder:text-zinc-700 leading-relaxed"
                placeholder="Paste SIH problem description here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="p-4 border-t border-white/5 bg-[#111]/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={18} className="animate-spin mr-2" /> Deconstructing Specs...</>
                  ) : (
                    <><BrainCircuit size={18} className="mr-2" /> Generate Execution Plan</>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3 backdrop-blur-sm">
                <ShieldAlert size={18} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Analysis failed</p>
                  <p className="text-xs text-red-400/80 mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {!analysis && !isAnalyzing && !error && (
              <div className="border border-white/5 border-dashed rounded-2xl p-8 text-center text-zinc-600 flex flex-col items-center">
                <Layers size={32} className="mb-4 opacity-50" />
                <p className="text-sm">Enter a problem statement to generate architecture, risk analysis, and team fit scores.</p>
                <p className="text-xs mt-2 font-mono">Status: Standby</p>
              </div>
            )}
          </div>

          <div className="xl:col-span-8">
            {isAnalyzing && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-500 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 size={48} className="animate-spin text-blue-500 relative z-10" />
                </div>
                <p className="animate-pulse font-mono text-sm tracking-widest uppercase">Processing Request...</p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <Cpu size={200} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-4 inline-block">
                      {analysis.identity.domain}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight leading-tight">
                      {analysis.identity.title}
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base border-l-2 border-zinc-800 pl-4 py-1 leading-relaxed max-w-3xl">
                      {analysis.identity.coreProblem}
                    </p>
                  </div>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-zinc-900/50 rounded-2xl border border-white/5 w-fit">
                  <TabButton id="scorecard" icon={TrendingUp} label="Scorecard" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton id="engineering" icon={Server} label="Engineering Plan" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton id="skills" icon={Users} label="Team & Stack" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton id="ai" icon={Code2} label="AI & Vibe Coding" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton id="risks" icon={ShieldAlert} label="Verdict & Risks" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <div className="bg-transparent min-h-[400px]">
                  {activeTab === "scorecard" && <ScorecardTab scorecard={analysis.scorecard} teamFit={analysis.teamFit} />}
                  {activeTab === "engineering" && <EngineeringTab engineering={analysis.engineeringInterpretation} taskAllocation={analysis.taskAllocation} />}
                  {activeTab === "skills" && <SkillsTab teamAndSkills={analysis.teamAndSkills} techStack={analysis.techStack} skillGapRecommendations={analysis.skillGapRecommendations} />}
                  {activeTab === "ai" && <AiVibeTab aiAndVibeCoding={analysis.aiAndVibeCoding} aiVibePotential={analysis.scorecard.aiVibePotential} />}
                  {activeTab === "risks" && <VerdictTab verdict={analysis.verdict} risks={analysis.risks} />}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}