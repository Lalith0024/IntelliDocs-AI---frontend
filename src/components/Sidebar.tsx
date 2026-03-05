import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, LogOut, LayoutGrid, Pencil, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from './BrandLogo';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const loadChats = async () => {
    try {
      const data = await chatService.getChats();
      setChats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (chatId: string) => {
    if (!editTitle.trim()) return;
    try {
      await chatService.renameChat(chatId, editTitle.trim());
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: editTitle.trim() } : c));
      setEditingId(null);
      setEditTitle('');
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  const handleDelete = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      setActiveMenu(null);
      // If we're on this chat, navigate home
      if (window.location.search.includes(chatId)) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEditing = (chat: any) => {
    setEditingId(chat.id);
    setEditTitle(chat.title || 'Draft Study');
    setActiveMenu(null);
  };

  return (
    <div className="hidden md:flex flex-col h-screen w-[280px] bg-white border-r border-slate-100 p-6 relative">

      {/* App Logo */}
      <div className="py-6 flex items-center gap-3 cursor-pointer mb-6" onClick={() => navigate('/')}>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-50 transition-all hover:shadow-md">
          <BrandLogo className="w-9 h-9" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Intellidocs</h1>
      </div>

      {/* New Chat Button */}
      <button
        onClick={() => {
          navigate('/', { replace: true });
          window.location.reload();
        }}
        className="w-full flex items-center gap-3 px-5 py-4 bg-[#f8f9fa] border border-transparent rounded-2xl text-[14px] font-bold text-slate-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all mb-8 group"
      >
        <Plus className="w-4 h-4 text-blue-600 group-hover:rotate-90 transition-transform duration-300" />
        Start Fresh
      </button>

      {/* History */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-8 custom-scrollbar">
        <p className="px-2 pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Your Conversations</p>
        <div className="space-y-1">
          {chats.length === 0 ? (
            <div className="px-3 py-10 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                <MessageSquare className="w-4 h-4 text-slate-200" />
              </div>
              <p className="text-xs font-bold text-slate-300 tracking-tight">No chats yet</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="relative group">
                {editingId === chat.id ? (
                  /* --- EDIT MODE --- */
                  <div className="flex items-center gap-1.5 px-2 py-2">
                    <input
                      ref={editRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id);
                        if (e.key === 'Escape') { setEditingId(null); setEditTitle(''); }
                      }}
                      className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition-colors min-w-0"
                    />
                    <button
                      onClick={() => handleRename(chat.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditTitle(''); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* --- NORMAL MODE --- */
                  <div className="flex items-center">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => navigate(`/?chat=${chat.id}`)}
                      className="flex-1 flex items-center gap-3 px-3 py-3 text-[14px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all text-left truncate min-w-0"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                        <MessageSquare className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-blue-500" />
                      </div>
                      <span className="truncate flex-1 tracking-tight">{chat.title || 'Draft Study'}</span>
                    </motion.button>

                    {/* Action buttons - appear on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(chat); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Rename"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === chat.id ? null : chat.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation dropdown */}
                <AnimatePresence>
                  {activeMenu === chat.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-2 top-full z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-[200px]"
                    >
                      <p className="text-xs font-bold text-slate-700 mb-3 px-1">Delete this chat?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(chat.id)}
                          className="flex-1 py-2 px-3 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setActiveMenu(null)}
                          className="flex-1 py-2 px-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* App Settings/Navigation */}
      <div className="space-y-1 pt-6 border-t border-slate-100">
        <button
          onClick={() => navigate('/files')}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-[14px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group"
        >
          <LayoutGrid className="w-4 h-4" />
          My Data Studio
        </button>

        <div className="px-3 py-5 mt-4 flex items-center justify-between bg-slate-50 rounded-[24px] border border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{user?.email?.split('@')[0]}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Personal Plan</p>
              </div>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
