import { Zap, Users } from 'lucide-react';

const Header = ({ teamName = "Guest Team" }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">
            SIH Intelligence<span className="text-blue-500">.</span>
          </h1>
        </div>

        {/* User / Team Profile Section */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Users size={16} className="text-slate-400" />
            <span className="text-slate-300">
              Active Profile: <span className="text-white font-medium">{teamName}</span>
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;