import { Zap, Users, Settings } from "lucide-react";

const Header = ({ teamName = "Guest Team", onTeamProfileClick }) => (
  <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Zap size={18} className="text-white fill-white" />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-zinc-100">
          SIH Intelligence<span className="text-blue-500">.</span>
        </h1>
      </div>
      <div className="flex items-center space-x-3 text-sm">
        <button
          type="button"
          onClick={onTeamProfileClick}
          className="group flex items-center space-x-2 bg-zinc-900/50 px-4 py-1.5 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-zinc-800 transition-all duration-300"
          title="Open team profile"
        >
          <Users size={14} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
          <span className="text-zinc-400">
            Active Profile: <span className="text-zinc-200 font-medium ml-1">{teamName}</span>
          </span>
          <Settings size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors ml-1" />
        </button>
      </div>
    </div>
  </header>
);

export default Header;
