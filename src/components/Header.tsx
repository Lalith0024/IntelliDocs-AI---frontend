import { Search, FileText, PieChart, Settings, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

export const Header = () => {
  const navItems = [
    { icon: Search, label: 'Search', to: '/' },
    { icon: FileText, label: 'Documents', to: '/files' },
    { icon: PieChart, label: 'Analytics', to: '/analytics' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center justify-between px-8 sm:px-12 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 transition-all duration-300">

      {/* Brand */}
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[14px] shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-black text-xl transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
          ID
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-display">IntelliDocs</h1>
          <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">Intelligence Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <div className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-[12px] text-xs font-bold uppercase tracking-widest transition-all duration-300 relative",
                isActive
                  ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 ring-1 ring-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              )}>
                <item.icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all group relative">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right hidden lg:block">
            <div className="text-[11px] font-bold text-slate-900">Kasula Lalithendra</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administrator</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-slate-900/20 ring-4 ring-white cursor-pointer hover:scale-110 transition-transform overflow-hidden relative group">
            KL
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
        </div>

        {/* Mobile Menu Button (Hidden on Desktop) */}
        <button className="md:hidden p-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
