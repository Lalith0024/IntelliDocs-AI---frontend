import { useState } from 'react';
import { FileText, ChevronRight, ChevronDown, Eye } from 'lucide-react';
import type { Source } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface SourceCardProps {
  source: Source;
  index: number;
}

export const SourceCard = ({ source, index }: SourceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const confidenceColor = {
    high: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-rose-500 bg-rose-50 border-rose-100',
  }[source.confidence] || 'text-slate-400 bg-slate-50 border-slate-100';

  return (
    <motion.div
      layout
      className={cn(
        "group overflow-hidden transition-all duration-300 rounded-xl border",
        isExpanded ? "bg-white border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-start gap-4 transition-colors"
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          isExpanded ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
        )}>
          <FileText className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h4 className={cn(
              "text-sm font-bold truncate transition-colors",
              isExpanded ? "text-slate-900" : "text-slate-700"
            )}>
              {source.filename}
            </h4>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border", confidenceColor)}>
              {source.confidence} Match
            </span>
            {!source.passed_threshold && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Low Relevance
              </span>
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4 pt-0 pl-18">
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <Eye className="w-3 h-3" /> Excerpt Content
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-600 text-xs leading-relaxed font-medium font-mono whitespace-pre-wrap">
                    {source.content}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
