import { Zap, Users, Settings } from "lucide-react";

const Header = ({
  teamName = "Guest Team",
  onTeamProfileClick,
}) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.45)]">
            <Zap size={17} className="text-white" fill="currentColor" />
          </div>

          <h1 className="font-semibold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
            SIH Intelligence
            <span className="text-blue-500">.</span>
          </h1>
        </div>

        {/* Team Profile */}
        <div className="flex items-center gap-3 text-sm min-w-0">
          <button
            type="button"
            onClick={onTeamProfileClick}
            className="group flex items-center gap-2 min-w-0 bg-white/[0.04] pl-2.5 pr-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-colors"
            title="Open team profile"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] shrink-0">
              <Users
                size={12}
                className="text-slate-400 group-hover:text-blue-400 transition-colors"
              />
            </span>

            <span className="min-w-0 truncate text-slate-400">
              <span className="hidden sm:inline">Active Profile: </span>
              <span className="text-white font-medium">{teamName}</span>
            </span>

            <Settings
              size={13}
              className="text-slate-500 group-hover:text-slate-300 group-hover:rotate-45 transition-all shrink-0"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;