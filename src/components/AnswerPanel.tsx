import { CheckCircle2, AlertTriangle, Quote } from 'lucide-react';
import type { QueryResponse } from '../types/api';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';

interface AnswerPanelProps {
  data: QueryResponse;
}

export const AnswerPanel = ({ data }: AnswerPanelProps) => {
  const isFailed = !data.success;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-white rounded-[2.5rem] border shadow-sm overflow-hidden relative",
        isFailed ? "border-amber-200" : "border-slate-200/50"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />

      <div className="p-8 lg:p-12 space-y-10">

        {/* Simplified Header */}
        <div className="flex items-start gap-5">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft",
            isFailed ? "bg-amber-50 text-amber-600" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-slate-900/10"
          )}>
            {isFailed ? <AlertTriangle className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
          </div>
          <div className="pt-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {isFailed ? "No Direct Evidence Found" : "Intelligent Analysis"}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              {isFailed
                ? "The query didn't match any documents closely enough."
                : "Verified findings from your document collection."}
            </p>
          </div>
        </div>

        {/* The Answer Content */}
        <div className="relative pl-8 border-l-2 border-slate-100/80">
          <Quote className="absolute -top-5 -left-4 w-8 h-8 text-indigo-100 bg-white p-1" />
          <div className={cn(
            "prose-custom transition-all duration-300",
            "text-slate-700 text-lg leading-[1.8] font-medium",
            isFailed && "italic text-slate-500"
          )}>
            <ReactMarkdown>
              {data.answer}
            </ReactMarkdown>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
