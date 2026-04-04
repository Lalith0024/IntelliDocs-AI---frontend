import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/api';
import {
  Edit, Search, Settings, LogOut, MessageSquare, Database, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentChatId = new URLSearchParams(location.search).get('chat');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: chats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChats,
  });

  const sidebarContent = (
    <aside className={cn(
      "w-[260px] h-screen bg-[#202123] text-white border-r border-[#ffffff10] flex flex-col z-50 shrink-0 font-sans select-none",
      !isOpen && "hidden md:flex"
    )}>
      
      {/* HEADER / LOGO */}
      <div className="h-14 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-[12px]">
            ID
          </div>
          <span className="font-semibold text-[15px] tracking-tight">IntelliDocs</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 hover:bg-[#2A2B32] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MAIN ACTIONS */}
      <div className="px-3 pt-2 space-y-1">
        <button
          onClick={() => { navigate('/'); window.location.reload(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2A2B32] transition-colors group"
        >
          <Edit className="w-4 h-4 shrink-0 text-[#ececf1]" />
          <span className="text-[14px] font-medium leading-none text-[#ececf1]">New chat</span>
        </button>
        <div className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#2A2B32] rounded-lg group text-[#ececf1] focus-within:ring-1 focus-within:ring-white/20 transition-all">
          <Search className="w-4 h-4 shrink-0 text-[#ececf1]" />
          <input 
            type="text" 
            placeholder="Search chats" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[14px] font-medium text-[#ececf1] placeholder-[#8e8ea0] w-full"
          />
        </div>
      </div>

      {/* RECENT SESSIONS */}
      <div className="flex-1 overflow-y-auto px-3 py-4 mt-2 space-y-1 custom-scrollbar">
        <span className="px-3 text-[12px] font-semibold text-[#8e8ea0] mb-2 block">Recent</span>
        {isLoadingChats ? (
          <div className="py-2 space-y-3 px-3">
            <div className="h-3 bg-[#ffffff10] rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-[#ffffff10] rounded w-3/4 animate-pulse" />
          </div>
        ) : chats.length === 0 ? (
          <div className="py-4 px-3 text-[12px] text-[#8e8ea0]">No chats yet</div>
        ) : (
          chats.filter((c: any) => c.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => {
                navigate(`/?chat=${chat.id}`);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative cursor-pointer",
                currentChatId === String(chat.id) ? "bg-[#343541]" : "hover:bg-[#2A2B32]"
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-[#ececf1] opacity-70" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-[13px] font-medium leading-tight text-[#ececf1]">
                  {chat.title || 'New Chat'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-[#ffffff10] space-y-1">
         <button onClick={() => { navigate('/documents'); if (onClose) onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2A2B32] transition-colors text-[#ececf1]">
           <Database className="w-4 h-4" />
           <span className="text-[14px] font-medium">My Files</span>
         </button>
         <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2A2B32] transition-colors text-[#ececf1]">
           <Settings className="w-4 h-4" />
           <span className="text-[14px] font-medium">Settings</span>
         </button>
         <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2A2B32] transition-colors text-red-500 hover:text-red-400 cursor-pointer">
           <LogOut className="w-4 h-4" />
           <span className="text-[14px] font-medium">Logout</span>
         </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop View (Fixed) */}
      <div className="hidden md:flex shrink-0 border-r border-[#ffffff10]">
         {sidebarContent}
      </div>

      {/* Mobile View (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[70] md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
