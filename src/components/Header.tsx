import { Search, FileText, PieChart, Settings, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

export const Header = () => {
  const navItems = [
    { icon: Search, label: 'Search', to: '/' },
    { icon: FileText, label: 'Documents', to: '/files' },
    { icon: PieChart, label: 'Insights', to: '/analytics' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-6 sm:px-8 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300">

      {/* Brand */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-black text-lg transform group-hover:scale-105 transition-transform">
          ID
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">IntelliDocs AI</h1>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Enterprise Search</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden",
              isActive
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors group relative">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3 pl-2 sm:pl-0">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-slate-900/20 ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
            KL
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
