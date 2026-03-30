import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL, filesService, chatService } from '../services/api';
import { 
  ArrowUp, FileText, AlertTriangle, X, Plus, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppError } from '../context/ErrorContext';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  latency_ms?: number;
  intent?: string;
  docs?: any[];
  suggestions?: string[];
};

const INSIGHT_QUOTES = [
  "Your documents hold the answers. Let's find them together.",
  "Transform your knowledge base into insights.",
  "Ask anything about your documents.",
  "Every document matters. Every question answered.",
  "From data to wisdom—one document at a time."
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md transition-all shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a8a8a8] hover:text-black hover:bg-[#f0f0f0]"
      title="Copy text"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeQuote, setActiveQuote] = useState(INSIGHT_QUOTES[0]);
  
  const { user } = useAuth();
  const { setError: setGlobalError } = useAppError();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentChatId = queryParams.get('chat');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setActiveQuote(INSIGHT_QUOTES[Math.floor(Math.random() * INSIGHT_QUOTES.length)]);
  }, []);

  // LOAD EXISTING CHAT HISTORY (Persistence Layer)
  useEffect(() => {
    if (currentChatId) {
      chatService.getChat(currentChatId).then(chat => {
        const history: Message[] = chat.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content
        }));
        setMessages(history);
      }).catch(() => {
        setMessages([]);
      });
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const { data: uploadedFiles = [] } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.listFiles,
    refetchInterval: 10000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSearch = async (e?: React.FormEvent, forceQuery?: string) => {
    e?.preventDefault();
    const query = forceQuery || inputMessage;
    if (!query.trim() || isThinking) return;

    const userMessage: Message = { id: Date.now().toString() + "user", role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = query;
    setInputMessage('');
    setIsThinking(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/chats/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: currentQuestion,
          chat_id: currentChatId 
        })
      });

      if (!response.ok) throw new Error("Stream connection failed.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = { 
        id: Date.now().toString() + "assistant", 
        role: 'assistant', 
        content: '',
        docs: [] 
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.replace('data: ', '').trim();
            if (raw === '[DONE]') break;
            try {
              const parsed = JSON.parse(raw);
              
              // 1. Session Persistence (No multiple queries in sidebar)
              if (parsed.chat_id && !currentChatId) {
                navigate(`/?chat=${parsed.chat_id}`, { replace: true });
                queryClient.invalidateQueries({ queryKey: ['chats'] });
              }

              // 2. Direct Grounding Packet
              if (parsed.docs) {
                 assistantMessage.docs = parsed.docs;
              }
              
              // 3. Content Stream
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages((prev) => 
                  prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                );
              }

              // 4. Dynamic Suggestions
              if (parsed.suggestions) {
                assistantMessage.suggestions = parsed.suggestions;
                setMessages((prev) => 
                  prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                );
              }
            } catch (e) { }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: 'err', role: 'error', content: "Neural Stream Connection Interrupted. Document synthesis failed." }
      ]);
    } finally {
      setIsThinking(false);
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const uploadFiles = async (files: File[]) => {
    try {
      const uploaded = await filesService.uploadFiles(files);
      setSelectedFiles((prev) => [...prev, ...uploaded]);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err) {
       setGlobalError({ title: "Integration Error", description: "Only PDF docs supported.", type: 'error' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const userName = user?.email?.split('@')[0] || 'demo';

  return (
    <div className="flex flex-col h-full bg-white text-black overflow-hidden font-sans select-none">
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[768px] mx-auto px-4 md:px-8 py-12 md:py-20 lg:py-24 pb-48">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <FileText className="w-12 h-12 text-[#a8a8a8] mb-6" />
                <h1 className="text-[32px] font-bold text-black tracking-tight mb-4">Hello, {userName}</h1>
                <p className="text-[18px] font-normal italic text-[#666] tracking-tight mb-12">"{activeQuote}"</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4 text-left">
                  {[
                    { t: "Deep Summary", i: "📚", d: "Summarize my documents" },
                    { t: "Extract Gaps", i: "🔍", d: "What information is missing?" },
                    { t: "Audit Timeline", i: "⏱️", d: "Create a timeline of events" },
                    { t: "Key Terms", i: "💡", d: "Define the core concepts" }
                  ].map((feat, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, borderColor: '#10A37F', boxShadow: '0 8px 16px rgba(16, 163, 127, 0.08)' }}
                      onClick={() => setInputMessage(feat.d)}
                      className="p-6 text-left bg-white border border-[#e5e5e5] border-l-[4px] border-l-[#10A37F]/50 hover:border-l-[#10A37F] rounded-lg shadow-subtle flex flex-col items-start transition-all duration-300 group"
                    >
                      <span className="text-[30px] mb-4">{feat.i}</span>
                      <h3 className="text-[16px] font-bold text-black tracking-tight">{feat.t}</h3>
                      <p className="text-[14px] font-normal text-[#666]">{feat.d}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-10">
                {messages.map((msg, idx) => {
                  const isLastMessage = idx === messages.length - 1;
                  return (
                  <div key={msg.id} className={cn("flex flex-col gap-3 max-w-full group/msg", msg.role === 'user' ? "items-end" : "items-start")}>
                    {/* DIRECT GROUNDING - ALL LEGACY BADGES REMOVED */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-3 ml-1 animate-fade-in group">
                        <div className="px-3 py-1.5 bg-[#e8f5e9] border border-[#10A37F]/10 border-l-[3.5px] border-l-[#10A37F] rounded-sm text-[11px] font-bold text-[#10A37F] uppercase tracking-wider">
                           Based on: {msg.docs && msg.docs.length > 0 ? Array.from(new Set(msg.docs.map(d => d.filename))).join(', ') : 'Knowledge Base'}
                        </div>
                      </div>
                    )}

                    {msg.role === 'error' ? (
                       <div className="w-full alert-error flex items-center gap-3 font-semibold text-red-600 border-red-500 bg-red-50 p-4 rounded-lg border">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {msg.content}
                       </div>
                    ) : msg.role === 'user' ? (
                      <div className="flex items-center gap-3 w-full justify-end group/bubble">
                        <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200">
                          <CopyButton text={msg.content} />
                        </div>
                        <div className="bubble-user bg-black text-white p-4 rounded-xl max-w-[85%] relative">
                          <div className="prose-chat prose-premium max-w-none text-[15px] leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full group/bubble">
                        <div className="bubble-assistant border-l-[3.5px] border-l-[#10A37F] bg-white shadow-sm p-4 rounded-xl w-full relative">
                          <div className="prose-chat prose-premium max-w-none text-[15px] leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex justify-start mt-2 ml-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200">
                          <CopyButton text={msg.content} />
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC SUGGESTIONS */}
                    {msg.role === 'assistant' && isLastMessage && !isThinking && msg.suggestions && (
                      <div className="flex flex-wrap items-center gap-2 mt-4 ml-1 animate-fade-in">
                        {msg.suggestions.map((sug, i) => (
                           <button 
                             key={i}
                             onClick={() => handleSearch(undefined, sug)}
                             className="px-4 py-2 bg-white border border-[#e5e5e5] hover:border-[#10A37F] text-[#666] hover:text-black text-[13px] font-medium rounded-2xl transition-all shadow-subtle hover:shadow-md"
                           >
                             {sug}
                           </button>
                        ))}
                      </div>
                    )}
                  </div>
                )})}
                {isThinking && (
                  <div className="flex flex-col items-start gap-4 animate-pulse">
                     <div className="px-3 py-1.5 bg-[#f8f8f8] border border-l-[3.5px] border-l-[#10A37F] rounded-sm text-[11px] font-bold text-[#a8a8a8] uppercase tracking-wider">
                         Synthesizing Document Stream...
                      </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-10" />
        </div>
      </main>

      <div className="bg-white border-t border-[#e5e5e5] p-4 md:p-6 lg:pb-10 shrink-0">
        <div className="max-w-[768px] mx-auto relative group">
          <form onSubmit={handleSearch} className="relative bg-white border border-[#cccccc] focus-within:border-[#10A37F] rounded-lg p-3 flex flex-col gap-3 transition-all duration-200 focus-within:ring-4 focus-within:ring-[#10A37F]/5 shadow-subtle overflow-hidden">
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1 pt-1">
                  {selectedFiles.map((file, idx) => (
                    <motion.div key={file.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative flex items-center gap-2.5 bg-[#f8f8f8] border border-[#e5e5e5] border-l-[3px] border-l-[#10A37F] rounded-md pl-2 pr-3 py-1.5 min-w-[120px] max-w-[200px]">
                      <FileText className="w-4 h-4 text-[#666]" />
                      <span className="text-[12px] font-bold text-black truncate flex-1">{file.filename}</span>
                      <X onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))} className="w-3.5 h-3.5 text-[#a8a8a8] cursor-pointer hover:text-black" />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <div className="flex items-end gap-3">
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black hover:bg-[#f0f0f0] rounded-lg transition-all shrink-0">
                <Plus className="w-5 h-5" />
              </button>
              <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Explore your knowledge hub..." rows={1} className="flex-1 bg-transparent border-none outline-none py-3 px-1 resize-none text-[15px] font-normal text-black placeholder:text-[#a8a8a8] max-h-[300px] leading-relaxed" />
              <button type="submit" disabled={!inputMessage.trim() || isThinking} className="bg-black text-white p-3 rounded-lg flex items-center justify-center shrink-0 disabled:bg-[#cccccc] mb-0.5">
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>
          {uploadedFiles.length > 0 && <p className="text-[11px] text-center mt-3 text-[#a8a8a8] font-medium uppercase tracking-[0.2em] opacity-40">Intelligence Stream Hub • {uploadedFiles.length} Assets Synchronized</p>}
        </div>
      </div>
    </div>
  );
};