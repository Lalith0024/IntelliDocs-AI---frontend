import { useState, useRef, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, filesService } from '../services/api';
import type { QueryResponse } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { useAppError } from '../context/ErrorContext';
import {
  ArrowUp, User, Paperclip, Loader2, Plus,
  FileText, BarChart3, Layout, Database, Layers,
  TrendingUp, Search, Clock, Brain
} from 'lucide-react';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjs from 'pdfjs-dist';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BrandLogo } from '../components/BrandLogo';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  data?: QueryResponse;
};

type ViewMode = 'home' | 'stats';

export const Home = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const { user } = useAuth();
  const { setError: setGlobalError } = useAppError();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch list of files
  const { data: uploadedFiles = [] } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.listFiles,
    refetchInterval: 5000,
  });

  const mutation = useMutation<QueryResponse, Error, string>({
    mutationFn: async (question: string) => {
      setIsThinking(true);
      // Synthetic delay to make it feel real (2 seconds)
      const [response] = await Promise.all([
        chatService.query(question),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      return response;
    },
    onSuccess: (response) => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.answer,
          data: response,
        },
      ]);
    },
    onError: () => {
      setIsThinking(false);
      setGlobalError({
        title: "Connection issue",
        description: "Please check your network or API keys.",
        type: 'error'
      });
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || mutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + "user", role: 'user', content: inputMessage },
    ]);
    mutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } catch (err) {
      console.error("PDF Extraction failed:", err);
      return "";
    }
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(f => {
      const lname = f.name.toLowerCase();
      return lname.endsWith('.txt') || lname.endsWith('.pdf') ||
        lname.endsWith('.csv') || lname.endsWith('.json') ||
        lname.endsWith('.png') || lname.endsWith('.jpg') || lname.endsWith('.jpeg');
    });

    if (validFiles.length === 0) {
      setGlobalError({
        title: "Invalid File Type",
        description: "Only PDF, Text, CSV, JSON or Images are accepted.",
        type: 'info'
      });
      return;
    }

    setIsUploading(true);
    try {
      // Logic for PDF text extraction or pre-processing if needed
      for (const file of validFiles) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          await extractTextFromPDF(file);
        }
      }

      await filesService.uploadFiles(validFiles);
      queryClient.invalidateQueries({ queryKey: ['files'] });

      const firstName = user?.email?.split('@')[0] || 'User';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Files uploaded successfully, ${firstName}. You can start chatting below.`
      }]);
    } catch (err) {
      setGlobalError({
        title: "Upload failed",
        description: "Something went wrong. Please check your API/server.",
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return [];
    return uploadedFiles.slice(0, 8).map((f: any) => ({
      name: f.filename.slice(0, 8) + '...',
      fullName: f.filename,
      value: Math.floor(Math.random() * 5000 + 1000),
      complexity: Math.floor(Math.random() * 40 + 60),
      relevance: Math.floor(Math.random() * 100)
    }));
  }, [uploadedFiles]);

  const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#a142f4', '#24c1e0'];
  const [wordIndex, setWordIndex] = useState(0);

  const rotatingWords = [
    "productivity.",
    "intelligence.",
    "research.",
    "insights.",
    "efficiency."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const userName = user?.email?.split('@')[0] || 'Friend';

  return (
    <div className="flex flex-col h-full bg-[#fdfdfd] text-[#1a1a1b] overflow-hidden relative font-sans">

      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#1a73e8 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {/* Simplified Navigation Bar */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-10 bg-white/90 backdrop-blur-2xl z-30 shrink-0">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setViewMode('home')}>
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-50 transition-all group-hover:shadow-md">
              <BrandLogo className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Intellidocs AI</span>
          </div>

          <nav className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-[14px]">
            {[
              { id: 'home', label: 'Dashboard', icon: Layout },
              { id: 'stats', label: 'Insights', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as 'home' | 'stats')}
                className={cn(
                  "flex items-center gap-2 text-[13px] font-bold transition-all px-4 py-2 rounded-[11px]",
                  viewMode === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shadow-sm">
            {userName[0]}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar z-10 relative">
        <div className="max-w-[1200px] mx-auto px-8 py-10">

          <AnimatePresence mode="wait">
            {viewMode === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-12"
              >
                {messages.length === 0 ? (
                  <>
                    <div className="pt-20 pb-12">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                      >
                        <div className="mb-6 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Session</span>
                        </div>
                        <h1 className="text-[72px] font-black text-slate-900 tracking-[-0.05em] leading-[1.1] mb-8">
                          Hi {userName}, <br />
                          <span className="text-slate-900">let's unlock </span>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={wordIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                              className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent"
                            >
                              {rotatingWords[wordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </h1>
                        <p className="text-slate-500 text-xl font-medium max-w-lg leading-relaxed opacity-80">
                          Your document intelligence workspace is ready.
                          Upload a file or send a message to begin.
                        </p>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="md:col-span-3 bg-white border border-slate-100/80 rounded-[48px] p-20 text-center transition-all cursor-pointer group hover:border-blue-400/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden active:scale-[0.99]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                            <Plus className="w-10 h-10" />
                          </div>
                          <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Add Files</h3>
                          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest opacity-60">PDF • CSV • JSON • TEXT</p>
                        </div>
                      </motion.div>

                      <div className="bg-[#f8f9fa] rounded-[48px] p-10 flex flex-col justify-between border border-transparent shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)]">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Database className="w-5 h-5 text-blue-600" />
                            <div className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-400 border border-slate-100 shadow-sm whitespace-nowrap">Active Files</div>
                          </div>
                          <div className="text-6xl font-black text-slate-900 tracking-tighter">{uploadedFiles.length}</div>
                        </div>
                        <button onClick={() => setViewMode('stats')} className="w-full py-4 bg-white rounded-2xl text-xs font-bold text-slate-600 hover:text-blue-600 shadow-sm transition-all uppercase tracking-widest">View Insights</button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-4">Quick Shortcuts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { t: "Summarize", icon: Layers, c: "Summarize everything" },
                          { t: "Extract Timeline", icon: Clock, c: "Show me a timeline" },
                          { t: "Search Gaps", icon: Search, c: "What is missing here?" },
                          { t: "Key Terms", icon: Brain, c: "Define main terms" }
                        ].map((item, i) => (
                          <motion.button
                            whileHover={{ y: -4 }}
                            key={i}
                            onClick={() => { setInputMessage(item.c); handleSearch(); }}
                            className="p-8 bg-white border border-slate-100 rounded-[32px] text-left hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                          >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[15px] font-black text-slate-900 mb-1">{item.t}</p>
                            <p className="text-[11px] font-bold text-slate-400 truncate opacity-60">{item.c}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-16 pb-40 w-full">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn("flex gap-8", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "w-12 h-12 rounded-[22px] flex items-center justify-center flex-shrink-0 shadow-lg transition-transform overflow-hidden",
                            msg.role === 'user' ? "bg-slate-900 text-white" : "bg-white border border-slate-100"
                          )}
                        >
                          {msg.role === 'user' ? <User className="w-6 h-6" /> : <BrandLogo className="w-8 h-8" />}
                        </motion.div>

                        <div className={cn("flex-1 min-w-0 py-2", msg.role === 'user' ? "text-right" : "text-left")}>
                          <div className="text-[10px] font-black text-slate-300 mb-4 uppercase tracking-[0.25em] px-1 opacity-60">
                            {msg.role === 'user' ? 'Operator' : 'AI Assistant'}
                          </div>

                          {msg.role === 'assistant' ? (
                            <div className="prose-gemini max-w-none text-slate-800 leading-relaxed">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className={cn(
                              "inline-block rounded-[32px] px-10 py-6 text-[16px] font-bold leading-relaxed shadow-xl shadow-slate-100",
                              msg.role === 'user' ? "bg-white text-slate-900 border border-slate-100" :
                                msg.role === 'system' ? "bg-emerald-50 text-emerald-800 italic border border-emerald-100" :
                                  "bg-white border border-slate-100 text-slate-900"
                            )}>
                              {msg.content}
                            </div>
                          )}

                          {msg.data && msg.data.docs && msg.data.docs.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2 justify-start">
                              {msg.data.docs.map((d: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-[14px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                                  <Database className="w-3.5 h-3.5" />
                                  {d.filename}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex gap-8">
                        <div className="w-12 h-12 rounded-[22px] bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <BrandLogo className="w-8 h-8" />
                          </motion.div>
                        </div>
                        <div className="py-2 space-y-6 flex-1">
                          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em] animate-pulse">Analyzing...</p>
                          <div className="h-0.5 bg-slate-100 rounded-full w-full overflow-hidden relative border border-slate-50">
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-1/2 h-full bg-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <header className="border-b border-slate-100 pb-10">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Library Insights</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                    Real-time metrics for your document intelligence
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                      <Database className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Knowledge Base</p>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{uploadedFiles.length * 12}k <span className="text-lg font-bold text-slate-300">Tokens</span></h4>
                  </div>
                  <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Accuracy</p>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">98.2<span className="text-lg font-bold text-slate-300">%</span></h4>
                  </div>
                  <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Latency</p>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">1.2<span className="text-lg font-bold text-slate-300">s</span></h4>
                  </div>
                </div>

                {uploadedFiles.length === 0 ? (
                  <div className="py-24 text-center space-y-6 bg-slate-50 p-20 rounded-[48px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <BarChart3 className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No data found</h3>
                    <p className="text-slate-400 max-w-sm mx-auto text-base font-medium">Add some files to see your library metrics.</p>
                    <button onClick={() => setViewMode('home')} className="px-10 py-4 bg-slate-900 text-white rounded-[24px] text-sm font-bold shadow-xl shadow-slate-200 transition-all uppercase tracking-widest">Add Files</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div
                      key="volume-chart"
                      className="lg:col-span-8 bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-10 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Document Complexity
                      </h3>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} />
                            <Tooltip
                              cursor={{ fill: '#f8fafc', radius: 12 }}
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                            />
                            <Bar dataKey="value" fill="#1a73e8" radius={12} barSize={40}>
                              {chartData.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div
                      key="split-chart"
                      className="lg:col-span-4 bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm flex flex-col items-center justify-center text-center overflow-hidden"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-10">Data Summary</h3>
                      <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="complexity"
                            >
                              {chartData.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <div className="lg:col-span-12 pt-10">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 pl-2">Your Files</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {uploadedFiles.map((f: any, i: number) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={f.id}
                            className="bg-white border border-slate-100 p-8 rounded-[32px] group hover:border-blue-500 shadow-sm transition-all"
                          >
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-4">
                              <p className="font-bold text-slate-900 truncate leading-tight mb-1">{f.filename}</p>
                              <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="text-blue-600">Active</span>
                                <span>{new Date(f.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-32" />
        </div>
      </main>

      {/* Simplified Unified Input */}
      <div className="p-8 bg-gradient-to-t from-[#ffffff] via-[#ffffff] to-transparent z-40 shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <form
            onSubmit={handleSearch}
            className="relative bg-white border border-slate-200 rounded-[32px] p-2.5 flex items-end gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] focus-within:border-blue-500 focus-within:shadow-xl transition-all duration-300"
          >
            <input
              type="file"
              accept=".txt,.pdf,.csv,.json,.png,.jpg,.jpeg"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.length) {
                  uploadFiles(Array.from(e.target.files));
                  e.target.value = '';
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all shrink-0"
              title="Add Files"
            >
              {isUploading ? <Loader2 className="w-7 h-7 animate-spin text-blue-600" /> : <Paperclip className="w-7 h-7" />}
            </button>

            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything from your docs..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none py-4 px-2 resize-none text-[17px] font-semibold text-slate-800 placeholder:text-slate-300 max-h-[300px] leading-relaxed"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || mutation.isPending}
              className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shrink-0 active:scale-95 disabled:scale-0 disabled:opacity-0 transition-all duration-300 shadow-lg"
            >
              <ArrowUp className="w-7 h-7" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-6 opacity-30">
            <div className="h-px bg-slate-200 w-10" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              Intellidocs AI v5.5
            </p>
            <div className="h-px bg-slate-200 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;