import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/api';
import {
  Plus, MessageSquare, LogOut, FileText, Settings,
  ChevronRight, Star, Trash2, Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { filesService } from '../services/api';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const currentChatId = new URLSearchParams(location.search).get('chat');

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChats,
  });

  const { data: uploadedFiles = [] } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.listFiles,
  });

  const deleteChatMutation = useMutation({
    mutationFn: chatService.deleteChat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  });

  // Starred logic placeholder
  const starredChats = chats.slice(0, 0);

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-[#e5e5e5] flex flex-col z-50 shrink-0 font-sans select-none">

      {/* LOGO & BRANDING (56px) */}
      <div className="h-14 px-4 flex items-center border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-[14px]">
            ID
          </div>
          <span className="font-semibold text-[16px] tracking-tight text-black">IntelliDocs</span>
        </div>
      </div>

      {/* NEW CHAT BUTTON - MAXIMUM PROMINENCE */}
      <div className="p-4">
        <button
          onClick={() => { navigate('/'); window.location.reload(); }}
          className="btn-new-chat py-4"
        >
          <Plus className="w-[18px] h-[18px]" />
          New Chat
        </button>
      </div>

      {/* CHAT SECTIONS - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">

        {/* STARRED SECTION */}
        {starredChats.length > 0 && (
          <section>
            <div className="flex items-center justify-between py-2 mb-1">
              <span className="text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Starred</span>
            </div>
            <div className="space-y-0.5">
              {starredChats.map((chat: any) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/?chat=${chat.id}`)}
                  className={cn(
                    "btn-sidebar-item group relative",
                    currentChatId === String(chat.id) ? "bg-[#f0f0f0] border-l-[3px] border-black text-black" : "text-[#333]"
                  )}
                >
                  <Star className="w-[14px] h-[14px] text-black fill-black shrink-0" />
                  <span className="truncate flex-1 text-[13px] font-medium leading-tight">
                    {chat.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KNOWLEDGE BASE / RECENT DOCUMENTS */}
        <section>
          <div className="flex items-center justify-between py-2 mb-1">
            <span className="text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Knowledge Hub</span>
            <span className="text-[11px] font-bold text-[#10A37F] bg-[#e8f5e9] px-1.5 py-0.5 rounded-full">{uploadedFiles.length}</span>
          </div>
          <div className="space-y-0.5">
            {uploadedFiles.slice(0, 3).map((file: any) => (
              <div
                key={file.id}
                className="btn-sidebar-item text-[#666] hover:bg-[#f0f0f0] cursor-default group"
              >
                <div className="w-1 h-3 bg-[#10A37F] rounded-full mr-1 opacity-40" />
                <span className="truncate flex-1 text-[13px] font-medium leading-none">{file.filename}</span>
              </div>
            ))}
            <div
              onClick={() => navigate('/documents')}
              className="btn-sidebar-item text-[#333] hover:text-black hover:bg-[#f0f0f0] cursor-pointer mt-2 border-t border-[#f0f0f0] pt-2"
            >
              <Database className="w-[14px] h-[14px] text-[#10A37F] shrink-0" />
              <span className="truncate flex-1 text-[13px] font-bold">Manage Repository</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </section>

        {/* RECENT SECTION */}
        <section>
          <div className="flex items-center justify-between py-2 mb-1">
            <span className="text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Recent Sessions</span>
          </div>
          <div className="space-y-0.5">
            {chats.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-8 h-8 text-[#e5e5e5] mb-2" />
                <p className="text-[14px] font-semibold text-[#333]">No chats yet</p>
                <p className="text-[11px] text-[#a8a8a8]">Start a new chat to begin</p>
              </div>
            ) : (
              chats.map((chat: any) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/?chat=${chat.id}`)}
                  className={cn(
                    "btn-sidebar-item group relative",
                    currentChatId === String(chat.id) ? "bg-[#f0f0f0] border-l-[3px] border-black text-black" : "text-[#333]"
                  )}
                >
                  <MessageSquare className="w-[14px] h-[14px] opacity-40 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-[13px] font-medium leading-tight">
                      {chat.title || 'New Chat'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChatMutation.mutate(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#a8a8a8] hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* DOCUMENTS NAVIGATION */}
      <div className="px-4 py-2 border-t border-[#e5e5e5]">
        <button
          onClick={() => navigate('/documents')}
          className="btn-sidebar-item w-full"
        >
          <FileText className="w-[16px] h-[16px] text-black" />
          <span className="flex-1 text-left text-[14px] font-medium">Documents</span>
          <ChevronRight className="w-[16px] h-[16px] text-[#a8a8a8]" />
        </button>
      </div>

      {/* FOOTER (Settings, Logout) */}
      <div className="p-2 border-t border-[#e5e5e5] min-h-[80px]">
        <button className="btn-sidebar-item w-full font-medium">
          <Settings className="w-[16px] h-[16px] text-black" />
          Settings
        </button>
        <button onClick={logout} className="btn-sidebar-item w-full font-medium text-red-600 hover:bg-red-50">
          <LogOut className="w-[16px] h-[16px]" />
          Logout
        </button>
      </div>

    </aside>
  );
};
