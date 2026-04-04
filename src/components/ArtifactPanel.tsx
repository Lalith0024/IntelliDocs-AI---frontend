import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface ArtifactPanelProps {
  artifact: any;
  onClose: () => void;
}

export const ArtifactPanel = ({ artifact, onClose }: ArtifactPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(artifact.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!artifact) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="fixed inset-0 md:relative md:flex-1 h-full bg-[#1e1e1e] md:border-l md:border-[#333] flex flex-col z-[100] md:z-auto overflow-hidden animate-slide-up md:animate-none"
    >
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between bg-[#1e1e1e] border-b border-[#333] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 hover:bg-[#333] rounded-md transition-colors text-[#888] hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#10A37F]" />
             <span className="text-[11px] font-mono font-bold text-[#888] uppercase tracking-[0.2em]">
               {artifact.type}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#333] rounded-lg transition-colors text-[11px] font-mono text-[#888] hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10A37F]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'COPIED' : 'COPY_JSON'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 flex flex-col items-stretch bg-[#0d0d0d]">
        {artifact.type === 'flashcard' && <FlashcardArtifact data={artifact.data} />}
        {artifact.type === 'checklist' && <ChecklistArtifact data={artifact.data} />}
        {artifact.type === 'quiz' && <QuizArtifact data={artifact.data} />}
        {artifact.type === 'chart' && <div className="w-full h-full flex items-center justify-center text-[#555] font-mono text-[12px] uppercase tracking-widest animate-pulse">Initializing Data Visualization Pipeline...</div>}
      </div>
    </motion.div>
  );
};

const FlashcardArtifact = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full max-w-full flex flex-col gap-6 mt-4 pb-20 font-mono">
      <div className="flex flex-col gap-4">
        {data.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#1e1e1e] border border-[#333] rounded-[12px] p-6 flex flex-col gap-5 group hover:border-[#10A37F] transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">
                 <span className="text-[#10A37F]">DOC_REF</span>
                 <span>// FLASH::{idx + 1}</span>
              </div>
              <h3 className="text-[17px] font-bold text-[#d4d4d4] leading-tight tracking-tight">
                {card.front}
              </h3>
            </div>
            
            <div className="h-px bg-[#333] w-full" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">
                 <span className="text-[#ce9178]">RESULT_DATA</span>
              </div>
              <div className="text-[15px] font-medium text-[#b5cea8] leading-relaxed">
                {card.back}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center p-8 bg-[#1e1e1e]/50 rounded-[12px] border border-[#333] border-dashed">
         <span className="text-[20px] mb-2 block">🌟</span>
         <h4 className="text-[14px] font-bold text-[#888] uppercase tracking-widest">Pipeline Completed</h4>
         <p className="text-[12px] text-[#555]">Documentation mastery in progress...</p>
      </div>
    </div>
  );
};

const ChecklistArtifact = ({ data }: { data: any[] }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="w-full max-w-full bg-[#1e1e1e] rounded-[12px] border border-[#333] shadow-sm overflow-hidden mt-4 font-mono">
      <div className="p-6 border-b border-[#333] bg-[#252526]">
        <h2 className="text-[14px] font-bold text-[#888] tracking-widest uppercase mb-1">Execution Roadmap</h2>
        <p className="text-[11px] text-[#555] uppercase tracking-wide">Status: Active Implementation</p>
      </div>
      <div className="divide-y divide-[#333]">
        {data.map((item, i) => (
          <div 
            key={i}
            onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
            className="flex items-start gap-4 p-5 hover:bg-[#2a2d2e] transition-colors cursor-pointer group"
          >
            <div className={cn(
              "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300",
              checked[i] ? "bg-[#10A37F] border-[#10A37F]" : "border-[#333] group-hover:border-[#555]"
            )}>
              {checked[i] && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn(
              "flex-1 text-[14px] leading-relaxed transition-all duration-300",
              checked[i] ? "text-[#555] line-through" : "text-[#d4d4d4]"
            )}>
              {item.task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizArtifact = ({ data }: { data: any }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === data.answerIndex;

  return (
    <div className="w-full max-w-full bg-[#1e1e1e] rounded-[16px] border border-[#333] p-10 mt-4 font-mono">
      <div className="mb-10">
        <span className="inline-block px-2 py-0.5 bg-[#10A37F]/10 text-[#10A37F] rounded text-[10px] font-bold uppercase tracking-widest mb-4 border border-[#10A37F]/20">Logic Unit Test</span>
        <h3 className="text-[18px] font-bold text-[#d4d4d4] leading-tight border-l-2 border-[#10A37F] pl-4">{data.question}</h3>
      </div>
      
      <div className="space-y-3">
        {data.options.map((opt: string, i: number) => (
          <button
            key={i}
            disabled={selected !== null}
            onClick={() => setSelected(i)}
            className={cn(
              "w-full p-5 rounded-[8px] border text-[14px] font-medium text-left transition-all duration-300",
              selected === null ? "border-[#333] hover:border-[#10A37F] hover:bg-[#2a2d2e]" : 
              selected === i ? (isCorrect ? "border-[#10A37F] bg-[#10A37F]/10 text-[#10A37F]" : "border-[#f44747] bg-[#f44747]/10 text-[#f44747]") : 
              i === data.answerIndex ? "border-[#10A37F] bg-[#10A37F]/5 text-[#10A37F] opacity-80" : "border-[#333] opacity-30"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {selected === i && (isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />)}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-[#252526] rounded-[8px] border border-[#333]"
          >
            <p className="text-[11px] font-bold text-[#10A37F] mb-2 uppercase tracking-widest">System Output Logs:</p>
            <p className="text-[13px] text-[#888] leading-relaxed italic">"{data.explanation}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
