import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'demo';

  return (
    <header className="h-[60px] border-b border-[#e5e5e5] bg-white flex items-center justify-between px-6 shrink-0 z-40 transition-all font-sans select-none">
      
      {/* LEFT: Branding & Hub Subtitle */}
      <div className="flex items-center gap-6">
        <button className="md:hidden p-2 -ml-2 text-[#666] hover:bg-[#f0f0f0] rounded-lg">
           <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
           <h1 className="text-[16px] font-semibold text-black leading-tight tracking-tight">IntelliDocs</h1>
           <p className="text-[12px] font-normal text-[#666] leading-none mt-1">Your document intelligence hub</p>
        </div>
      </div>

      {/* RIGHT: User Context & Role */}
      <div className="flex items-center gap-4">
         <div className="text-right hidden sm:flex flex-col border-r-[2.5px] border-r-[#10A37F] pr-3">
            <span className="text-[14px] font-semibold text-black leading-tight">{userName}</span>
            <span className="text-[10px] font-bold text-[#10A37F] uppercase tracking-[0.15em] mt-0.5">Primary Operator</span>
         </div>
         <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center font-bold text-white text-[13px] shadow-premium">
            {userName[0].toUpperCase()}
         </div>
      </div>
    </header>
  );
};
