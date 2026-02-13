import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar';
import { AnswerPanel } from '../components/AnswerPanel';
import { SourceCard } from '../components/SourceCard';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { queryService, API_URL } from '../services/api';
import type { QueryResponse } from '../types/api';
import { Link } from 'react-router-dom';
import { Database, Sparkles, ArrowRight, AlertTriangle, MessageCircleQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const SUGGESTED_QUESTIONS = [
  { label: "Vehicle Color", question: "What color was the vehicle involved in the incident?" },
  { label: "Officer Arrival", question: "When did officers arrive at the scene?" },
  { label: "Suspect Identity", question: "Who is the suspect and what vehicle do they drive?" },
  { label: "Impact Speed", question: "What was the estimated speed at impact?" },
  { label: "Witness Account", question: "What did the witness see at the scene?" },
  { label: "Scene Location", question: "Where did the incident take place?" },
];

export const Home = () => {
  const [data, setData] = useState<QueryResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (question: string) => queryService.performQuery({ question }),
    onSuccess: (response) => {
      setData(response);
    },
  });

  const handleSearch = (question: string) => {
    mutation.mutate(question);
  };

  const confidenceColor: Record<string, string> = {
    high: 'bg-emerald-500',
    medium: 'bg-amber-500',
    low: 'bg-rose-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white selection:bg-blue-100 pb-20">
      <div className="max-w-5xl mx-auto space-y-12 py-20 px-6 sm:px-8">

        {/* Dynamic Header / Hero Area */}
        <AnimatePresence mode="wait">
          {!data && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center space-y-8 max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Document Assistant</span>
              </motion.div>

              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Unlock insights <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">instantly.</span>
              </h2>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                Upload your documents and ask anything. We analyze every page to give you precise, evidence-backed answers in seconds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar Container */}
        <div className={cn(
          "transition-all duration-700 ease-[0.2,1,0.2,1] relative z-20",
          data || mutation.isPending ? "transform translate-y-0" : "transform translate-y-4"
        )}>
          <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-transform hover:scale-[1.01]">
            <SearchBar onSearch={handleSearch} isLoading={mutation.isPending} />
          </div>
        </div>

        {/* Suggested Questions Grid */}
        <AnimatePresence>
          {!data && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-widest">or try these examples</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUGGESTED_QUESTIONS.map((sq, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    onClick={() => handleSearch(sq.question)}
                    className="group text-left p-5 bg-white border border-slate-200/60 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest block mb-2 transition-colors">
                      {sq.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 leading-snug block">
                      {sq.question}
                    </span>
                    <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-blue-500 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback */}
        {mutation.isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl flex flex-col items-center text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-rose-900">Connection Failed</h3>
              <p className="text-sm text-rose-700 mt-2 leading-relaxed max-w-md">
                We couldn't connect to the Intelligence Engine at <strong>{API_URL}</strong>.
                Please ensure the backend is running and accessible.
              </p>
              <div className="mt-6 px-4 py-2 bg-white rounded-lg border border-rose-100 text-[10px] font-mono text-rose-500 uppercase tracking-wider">
                {mutation.error instanceof Error ? mutation.error.message : 'Unknown network error'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence mode="wait">
          {mutation.isPending ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12">
              <DashboardSkeleton />
            </motion.div>
          ) : data ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className="space-y-12"
            >
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Analysis Results
                </h3>
                <button
                  onClick={() => setData(null)}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50"
                >
                  <MessageCircleQuestion className="w-4 h-4" /> Ask Another Question
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                  <AnswerPanel data={data} />

                  {/* Simplified Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reliability</div>
                      <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", confidenceColor[data.confidence] || 'bg-slate-300')} />
                        <span className="capitalize">{data.confidence} Level</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sources Found</div>
                      <div className="text-base font-bold text-slate-900">
                        {data.valid_count} <span className="text-slate-400 font-medium">/ {data.retrieval_count} docs</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Speed</div>
                      <div className="text-base font-bold text-slate-900">{data.retrieval_time_ms}ms</div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Database className="w-4 h-4 text-slate-400" /> Source Data
                    </h4>
                    <Link to="/files" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 hover:underline">
                      Library
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {data.retrieved_documents.map((source, idx) => (
                      <SourceCard key={idx} source={source} index={idx} />
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;