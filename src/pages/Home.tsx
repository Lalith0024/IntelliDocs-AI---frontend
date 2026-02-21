import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar';
import { AnswerPanel } from '../components/AnswerPanel';
import { SourceCard } from '../components/SourceCard';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { queryService } from '../services/api';
import type { QueryResponse } from '../types/api';
import { Link } from 'react-router-dom';
import { Database, Sparkles, ArrowRight, MessageCircleQuestion, AlertTriangle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/30 selection:bg-blue-100 pb-20">
      <div className="max-w-6xl mx-auto space-y-12 py-20 px-6 sm:px-8">

        {/* Dynamic Header / Hero Area */}
        <AnimatePresence mode="wait">
          {!data && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="text-center space-y-8 max-w-4xl mx-auto pt-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Search Engine</span>
              </motion.div>

              <h1 className="text-6xl sm:text-8xl font-black text-slate-950 tracking-tight leading-[1] font-display">
                Decode your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient">documents.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                Smarter insights from your data library. Ask anything and get verified evidence in seconds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar Container */}
        <div className={cn(
          "transition-all duration-1000 ease-[0.2,1,0.2,1] relative z-20",
          data || mutation.isPending ? "transform translate-y-0" : "transform translate-y-6"
        )}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-2 rounded-[2.2rem] shadow-2xl shadow-slate-300/30 border border-slate-100 transform transition-transform hover:scale-[1.005]">
              <SearchBar onSearch={handleSearch} isLoading={mutation.isPending} />
            </div>
          </div>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {mutation.isError && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto pt-4"
            >
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-4 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-1">Search Failed</h4>
                  <p className="text-sm text-rose-700 font-medium">
                    We couldn't connect to the backend or an error occurred.
                    <br />
                    <span className="opacity-80">
                      Error: {mutation.error instanceof Error ? mutation.error.message : 'Unknown Error'}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested Questions Grid */}
        <AnimatePresence>
          {!data && !mutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-slate-200" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Discover insights</span>
                <div className="h-px w-12 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SUGGESTED_QUESTIONS.map((sq, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05, duration: 0.5 }}
                    onClick={() => handleSearch(sq.question)}
                    className="group text-left p-6 bg-white border border-slate-200/60 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-[0.15em] block mb-3 transition-colors">
                      {sq.label}
                    </span>
                    <span className="text-base font-semibold text-slate-700 group-hover:text-slate-900 leading-snug block">
                      {sq.question}
                    </span>
                    <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-blue-500 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence mode="wait">
          {mutation.isPending ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pt-12">
              <DashboardSkeleton />
            </motion.div>
          ) : data ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              className="space-y-12 pt-8"
            >
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-3">
                    Search Results
                  </h3>
                  <p className="text-sm font-medium text-slate-500">Based on {data.valid_count} verified document matches</p>
                </div>
                <button
                  onClick={() => setData(null)}
                  className="group text-xs font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200"
                >
                  <MessageCircleQuestion className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  New Research
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-10">
                  <AnswerPanel data={data} />

                  {/* Performance Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2 group hover:border-blue-100 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reliability</div>
                      <div className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", confidenceColor[data.confidence] || 'bg-slate-300')} />
                        <span className="capitalize">{data.confidence}</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2 group hover:border-blue-100 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matches</div>
                      <div className="text-xl font-bold text-slate-900">
                        {data.valid_count} <span className="text-slate-300 font-medium">/ {data.retrieval_count}</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2 group hover:border-blue-100 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing</div>
                      <div className="text-xl font-bold text-slate-900">{data.retrieval_time_ms}ms</div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2.5 text-xs uppercase tracking-[0.15em]">
                      <Database className="w-4 h-4 text-blue-500" /> Evidence Logs
                    </h4>
                    <Link to="/files" className="text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 hover:underline transition-colors">
                      Library
                    </Link>
                  </div>

                  <div className="space-y-5">
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