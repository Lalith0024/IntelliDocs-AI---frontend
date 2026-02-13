import { CheckCircle2, AlertTriangle, Quote } from 'lucide-react';
import type { QueryResponse } from '../types/api';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

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
        "bg-white rounded-[2rem] border shadow-sm overflow-hidden relative",
        isFailed ? "border-amber-200" : "border-slate-200/60"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />

      <div className="p-8 lg:p-10 space-y-8">

        {/* Simplified Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
            isFailed ? "bg-amber-50 text-amber-600" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          )}>
            {isFailed ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {isFailed ? "No Direct Evidence Found" : "AI Analysis"}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {isFailed
                ? "The query didn't match any documents closely enough."
                : "Generated from the most relevant sections of your documents."}
            </p>
          </div>
        </div>

        {/* The Answer Content */}
        <div className="relative pl-6 border-l-2 border-indigo-100">
          <Quote className="absolute -top-4 -left-3 w-6 h-6 text-indigo-200 bg-white p-1" />
          <p className={cn(
            "text-lg lg:text-xl leading-[1.6] text-slate-800 font-medium",
            isFailed && "text-slate-500 italic"
          )}>
            {data.answer}
          </p>
        </div>

      </div>
    </motion.div>
  );
};
