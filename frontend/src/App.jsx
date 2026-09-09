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

const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    type="button"
    onClick={() => setActiveTab(id)}
    className={`relative flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
      activeTab === id
        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
    }`}
  >
    <Icon size={15} />
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

  const SESSION_EXPIRED_MESSAGE =
    "Your team session is no longer authorized. Please recreate or reconnect the team profile.";

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
      console.error("Problem analysis failed:", error);

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
    <div className="min-h-screen bg-black text-slate-200 font-sans antialiased selection:bg-blue-500/30 relative">
      {/* Ambient background: subtle grid + glow, matches the rest of the site */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <Header
        teamName={teamName}
        onTeamProfileClick={() => setActiveView("team-profile")}
      />

      {activeView === "team-profile" ? (
        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveView("analyzer")}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Back to Analyzer
            </button>
          </div>

          <TeamProfileForm
            onSaved={handleTeamProfileSaved}
            onCancel={() => setActiveView("analyzer")}
          />
        </main>
      ) : (
        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="group relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl transition-colors hover:border-white/15">
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />

              <div className="relative inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 mb-4">
                <Target size={13} className="text-blue-400" />
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-blue-300">
                  Analyze Problem
                </span>
              </div>

              <p className="relative text-sm text-slate-400 mb-4 leading-relaxed">
                Paste your Smart India Hackathon problem statement here.
                We&rsquo;ll extract the engineering reality.
              </p>

              <textarea
                className="relative w-full h-48 bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 outline-none resize-none mb-4 font-mono placeholder:text-slate-600 transition-shadow"
                placeholder="Paste problem description, requirements, or upload PDF (coming soon)..."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="relative w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing Specs...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={18} />
                    Generate Execution Plan
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-5">
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

            {!analysis && !isAnalyzing && !error && (
              <div className="bg-white/[0.02] border border-white/10 border-dashed rounded-2xl p-6 text-center text-slate-500">
                <Layers size={28} className="mx-auto mb-3 opacity-40" />

                <p className="text-sm leading-relaxed">
                  Enter a problem statement to generate architecture, risk
                  analysis, and team fit scores.
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-24">
                <Loader2 size={40} className="animate-spin text-blue-500" />

                <p className="animate-pulse font-medium text-sm">
                  Deconstructing problem requirements...
                </p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.06]">
                    <Cpu size={120} />
                  </div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-400 mb-2">
                        {analysis.identity.domain}
                      </span>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight tracking-tight">
                        {analysis.identity.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm border-l-2 border-blue-500/40 pl-4 relative z-10 leading-relaxed">
                    {analysis.identity.coreProblem}
                  </p>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-1 p-1.5 rounded-full border border-white/10 bg-white/[0.02] w-fit max-w-full">
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

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-7 min-h-[400px] shadow-2xl">
                  {activeTab === "scorecard" && (
                    <ScorecardTab
                      scorecard={analysis.scorecard}
                      teamFit={analysis.teamFit}
                    />
                  )}

                  {activeTab === "engineering" && (
                    <EngineeringTab
                      engineering={analysis.engineeringInterpretation}
                      taskAllocation={analysis.taskAllocation}
                    />
                  )}

                  {activeTab === "skills" && (
                    <SkillsTab
                      teamAndSkills={analysis.teamAndSkills}
                      techStack={analysis.techStack}
                      skillGapRecommendations={analysis.skillGapRecommendations}
                    />
                  )}

                  {activeTab === "ai" && (
                    <AiVibeTab
                      aiAndVibeCoding={analysis.aiAndVibeCoding}
                      aiVibePotential={analysis.scorecard.aiVibePotential}
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