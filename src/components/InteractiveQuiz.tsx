import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

interface QuizProps {
  data: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }
}

export const InteractiveQuiz: React.FC<QuizProps> = ({ data }) => {
  const [selected, setSelected] = useState<number | null>(null);

  if (!data || !data.options) return <div>Invalid Quiz Data</div>;

  return (
    <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden font-sans">
      <div className="bg-[#fcfcfc] px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center gap-2">
           <BrainCircuit className="w-5 h-5 text-indigo-500" />
           <span className="font-semibold tracking-tight text-[15px] text-[#1a1a1a]">Knowledge Check</span>
        </div>
        <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">Interactive</span>
      </div>
      
      <div className="p-6">
        <h4 className="text-[17px] font-semibold text-[#1a1a1a] mb-5 leading-snug">{data.question}</h4>
        
        <div className="space-y-3">
          {data.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === data.answerIndex;
            const showStatus = selected !== null;
            
            let btnClass = "w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ";
            
            if (!showStatus) {
               btnClass += "border-[#e5e5e5] hover:border-indigo-500 hover:bg-indigo-50/30 text-[#333]";
            } else if (isCorrect) {
               btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium shadow-[0_0_0_1px_rgba(16,185,129,0.2)]";
            } else if (isSelected && !isCorrect) {
               btnClass += "border-red-500 bg-red-50 text-red-900 font-medium";
            } else {
               btnClass += "border-[#e5e5e5] opacity-50 text-[#888]";
            }

            return (
              <button 
                key={idx} 
                className={btnClass}
                onClick={() => selected === null && setSelected(idx)}
                disabled={selected !== null}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${showStatus && isCorrect ? 'bg-emerald-500 text-white' : showStatus && isSelected ? 'bg-red-500 text-white' : 'bg-[#f0f0f0] text-[#666]'}`}>
                     {String.fromCharCode(65 + idx)}
                   </div>
                   <span className="text-[15px]">{opt.replace(/^[A-D]\)\s*/, '')}</span>
                </div>
                {showStatus && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {showStatus && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {selected !== null && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#e9ecef] text-[15px] leading-relaxed text-[#444]">
                <strong className="text-[#1a1a1a] block mb-1">Explanation:</strong>
                {data.explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
