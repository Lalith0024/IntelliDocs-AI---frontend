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
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { ArtifactPanel } from '../components/ArtifactPanel';
import { useArtifact } from '../context/ArtifactContext';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  latency_ms?: number;
  intent?: string;
  docs?: any[];
  suggestions?: string[];
  attachedFiles?: any[];
};

const AuthImagePreview = ({ id, className }: { id: string, className?: string }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/api/documents/${id}/content`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => setUrl(URL.createObjectURL(blob)));
  }, [id]);
  return url ? <img src={url} className={className} alt="Attachment" /> : <div className={`animate-pulse bg-[#e5e5e5] ${className}`}/>;
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
  const [isDragging, setIsDragging] = useState(false);
  const [activeQuote, setActiveQuote] = useState(INSIGHT_QUOTES[0]);
  const { activeArtifact, setActiveArtifact } = useArtifact();
  
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

    const userMessage: Message = { 
      id: Date.now().toString() + "user", 
      role: 'user', 
      content: query,
      attachedFiles: selectedFiles.length > 0 ? [...selectedFiles] : undefined
    };
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
          chat_id: currentChatId,
          document_ids: selectedFiles.length > 0 ? selectedFiles.map(f => f.id) : undefined
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
              
              if (parsed.chat_id && !currentChatId) {
                navigate(`/?chat=${parsed.chat_id}`, { replace: true });
                queryClient.invalidateQueries({ queryKey: ['chats'] });
              }

              if (parsed.docs) {
                 assistantMessage.docs = parsed.docs;
              }
              
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages((prev) => 
                  prev.map(m => m.id === assistantMessage.id ? { ...assistantMessage } : m)
                );

                const contentSoFar = assistantMessage.content;
                const artifactTypes = ['flashcard', 'checklist', 'quiz', 'chart'];
                for (const type of artifactTypes) {
                  const blockTag = "```" + type;
                  if (contentSoFar.includes(blockTag) && contentSoFar.includes("```", contentSoFar.indexOf(blockTag) + blockTag.length)) {
                    const start = contentSoFar.lastIndexOf(blockTag);
                    const end = contentSoFar.indexOf("```", start + blockTag.length);
                    if (end !== -1) {
                      try {
                        const jsonStr = contentSoFar.substring(start + blockTag.length, end).trim();
                        const data = JSON.parse(jsonStr);
                        if (!activeArtifact || JSON.stringify(activeArtifact.data) !== JSON.stringify(data)) {
                           setActiveArtifact({ type, data });
                        }
                      } catch(e) {}
                    }
                  }
                }
              }

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

  useEffect(() => {
    let dragCounter = 0;
    const handleDragEnter = (e: DragEvent) => { e.preventDefault(); dragCounter++; setIsDragging(true); };
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); dragCounter--; if (dragCounter === 0) setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        uploadFiles(Array.from(e.dataTransfer.files));
      }
    };
    
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const userName = user?.email?.split('@')[0] || 'demo';

  return (
    <div className="flex h-full bg-white text-black overflow-hidden font-sans relative">
      <div className={cn(
        "flex flex-col h-full transition-all duration-500 ease-in-out relative origin-left overflow-hidden min-w-0 border-r border-[#e5e5e5] shrink-0",
        activeArtifact ? "w-[44%]" : "flex-1"
      )}>
        <AnimatePresence>
        {isDragging && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none">
             <div className="w-[98%] h-[98%] border-4 border-dashed border-[#10A37F] rounded-3xl flex items-center justify-center">
                <h2 className="text-3xl font-bold text-black tracking-widest text-shadow-sm">Drop files anywhere to attach</h2>
             </div>
          </motion.div>
        )}
        </AnimatePresence>
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-[850px] mx-auto px-4 md:px-8 py-10 md:py-16 pb-48">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div key="empty-state" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <FileText className="w-12 h-12 text-[#a8a8a8] mb-6" />
                  <h1 className="text-[32px] font-bold text-black tracking-tight mb-4">Hello, {userName}</h1>
                  <p className="text-[18px] font-normal italic text-[#666] tracking-tight mb-12">"{activeQuote}"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4 text-left">
                    {[
                      { t: "Deep Summary", i: "📚", d: "Summarize my documents" },
                      { t: "Extract Gaps", i: "🔍", d: "What info is missing?" },
                      { t: "Audit Timeline", i: "⏱️", d: "Create a timeline of events" },
                      { t: "Student Quiz", i: "🧠", d: "Generate an interactive MCQ test" }
                    ].map((feat, idx) => (
                      <motion.button key={idx} whileHover={{ scale: 1.02, borderColor: '#10A37F', boxShadow: '0 8px 16px rgba(16, 163, 127, 0.08)' }} onClick={() => setInputMessage(feat.d)} className="p-6 text-left bg-white border border-[#e5e5e5] border-l-[4px] border-l-[#10A37F]/50 hover:border-l-[#10A37F] rounded-lg shadow-subtle flex flex-col items-start transition-all duration-300 group">
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
                      <div key={msg.id} className={cn("flex flex-col gap-3 w-full group/msg", msg.role === 'user' ? "items-end" : "items-start")}>
                        {msg.role === 'assistant' && msg.docs && msg.docs.length > 0 && (
                          <div className="mb-1 animate-fade-in group">
                            <div className="px-3 py-1 bg-white border border-[#e5e5e5] rounded-lg text-[11px] font-bold text-[#666] uppercase tracking-[0.05em] inline-flex items-center gap-1.5 shadow-sm">
                               <FileText className="w-3 h-3" />
                               Sources: {Array.from(new Set(msg.docs.map(d => d.filename))).join(', ')}
                            </div>
                          </div>
                        )}
                        {msg.role === 'error' ? (
                           <div className="w-full alert-error flex items-center gap-3 font-semibold text-red-600 border-red-500 bg-red-50 p-4 rounded-lg border text-[14px]">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              {msg.content}
                           </div>
                        ) : msg.role === 'user' ? (
                          <div className="flex flex-col gap-2 w-full items-end group/bubble">
                            {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                              <div className="flex flex-wrap gap-2 justify-end mb-1 max-w-[75%]">
                                {msg.attachedFiles.map((file: any) => (
                                  <div key={file.id} className="relative overflow-hidden rounded-xl bg-white border border-[#e5e5e5]" style={{ width: '160px', height: '160px' }}>
                                    {file.filename.match(/\.(jpg|jpeg|png)$/i) ? <AuthImagePreview id={file.id} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-3 bg-white"><div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", file.filename.endsWith('.pdf') ? "bg-red-500" : "bg-blue-600")}><FileText className="w-6 h-6 text-white" /></div><span className="text-[13px] font-semibold text-center truncate w-full px-2" title={file.filename}>{file.filename}</span></div>}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2 justify-end w-full">
                              <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 mt-2"><CopyButton text={msg.content} /></div>
                              <div className="bg-[#f4f4f4] text-[#1a1a1a] px-5 py-3.5 rounded-2xl max-w-[75%] text-[15.5px] leading-[1.6] whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex w-full group/bubble">
                            <div className="prose-chat prose-premium w-full max-w-full relative text-[#1a1a1a]">
                              <MarkdownRenderer content={msg.content} />
                              <div className="flex flex-wrap items-center gap-3 mt-6 mb-2">
                                 <CopyButton text={msg.content} />
                                 {isLastMessage && !isThinking && msg.suggestions && (
                                   msg.suggestions.map((sug, i) => (
                                     <button key={i} onClick={() => handleSearch(undefined, sug)} className="px-4 py-1.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#555] hover:text-[#1a1a1a] text-[13px] font-medium rounded-full transition-all border border-transparent hover:border-[#ccc]">{sug}</button>
                                   ))
                                 )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {isThinking && <div className="flex flex-col items-start gap-4 animate-pulse ml-2"><div className="flex flex-col gap-2"><div className="h-2.5 w-64 bg-[#e5e5e5] rounded-full"></div><div className="h-2.5 w-48 bg-[#e5e5e5] rounded-full"></div></div></div>}
                </div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} className="h-10" />
          </div>
        </main>
        <div className="bg-white border-t border-[#e5e5e5] p-4 md:p-6 lg:pb-10 shrink-0">
          <div className="max-w-[850px] mx-auto relative group">
            <form onSubmit={handleSearch} className="relative bg-white border border-[#cccccc] focus-within:border-[#10A37F] rounded-lg p-3 flex flex-col gap-3 transition-all duration-200 focus-within:ring-4 focus-within:ring-[#10A37F]/5 shadow-subtle overflow-hidden">
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1 pt-1">
                    {selectedFiles.map((file, idx) => (
                      <motion.div key={file.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative flex items-center p-2 pr-10 bg-[#f8f8f8] border border-[#e5e5e5] rounded-[16px] shadow-sm gap-3 max-w-[240px]">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", file.filename.endsWith('.pdf') ? "bg-[#ff4e4e]" : file.filename.match(/\.(jpg|jpeg|png)$/i) ? "bg-white overflow-hidden border border-[#e5e5e5]" : "bg-blue-600")}>{file.filename.match(/\.(jpg|jpeg|png)$/i) ? <AuthImagePreview id={file.id} className="w-full h-full object-cover" /> : <FileText className="w-6 h-6 text-white" />}</div>
                        <div className="flex flex-col min-w-0"><span className="text-[13px] font-bold text-[#1a1a1a] truncate leading-tight">{file.filename}</span><span className="text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">{file.filename.split('.').pop()}</span></div>
                        <button type="button" onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white hover:bg-black hover:text-white border border-[#e5e5e5] rounded-full transition-colors text-[#555] shadow-sm"><X className="w-3.5 h-3.5" /></button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
              <div className="flex items-end gap-3">
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black hover:bg-[#f0f0f0] rounded-lg transition-all shrink-0"><Plus className="w-5 h-5" /></button>
                <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Explore your knowledge hub..." rows={1} className="flex-1 bg-transparent border-none outline-none py-3 px-1 resize-none text-[15px] font-normal text-black placeholder:text-[#a8a8a8] max-h-[300px] leading-relaxed" />
                <button type="submit" disabled={!inputMessage.trim() || isThinking} className="bg-black text-white p-3 rounded-lg flex items-center justify-center shrink-0 disabled:bg-[#cccccc] mb-0.5"><ArrowUp className="w-5 h-5" /></button>
              </div>
            </form>
            {uploadedFiles.length > 0 && <p className="text-[11px] text-center mt-3 text-[#a8a8a8] font-medium uppercase tracking-[0.2em] opacity-40">Intelligence Stream Hub • {uploadedFiles.length} Assets Synchronized</p>}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeArtifact && <ArtifactPanel artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />}
      </AnimatePresence>
    </div>
  );
};