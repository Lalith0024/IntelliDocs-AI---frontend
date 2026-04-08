import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Zap } from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';

const AnimatedText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const words = children.split(' ');
  return (
    <span>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + idx * 0.08, duration: 0.5 }}
          className="inline mr-2"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export const OnboardingModal = () => {
  const { showOnboarding, markOnboardingComplete } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const hasResetRef = useRef(false);

  // Reset to step 0 whenever modal opens
  // Note: Setting state in effect is safe here as it's syncing with showOnboarding
  useEffect(() => {
    if (showOnboarding && !hasResetRef.current) {
      setCurrentStep(0);
      hasResetRef.current = true;
    } else if (!showOnboarding) {
      hasResetRef.current = false;
    }
  }, [showOnboarding]);

  const steps = [
    {
      title: "Upload Multiple Files",
      description: "Start with any documents",
      icon: FileText,
      content: (
        <div className="flex flex-col items-center justify-center h-96 gap-8">
          <div className="relative w-40 h-40">
            {/* Animated file icons */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
              className="absolute top-0 left-0 w-24 h-32 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-12"
            >
              <FileText className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
              className="absolute bottom-0 right-0 w-24 h-32 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12"
            >
              <FileText className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          
          <div className="max-w-lg text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">
              <AnimatedText delay={0.6}>Upload any document</AnimatedText>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              <AnimatedText delay={0.9}>PDFs, spreadsheets, research papers, code—anything you need analyzed.</AnimatedText>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ask Anything",
      description: "Get instant answers from your documents",
      content: (
        <div className="flex flex-col items-center justify-center h-96 gap-8">
          {/* Chat bubbles animation */}
          <div className="w-80 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-start"
            >
              <div className="bg-blue-100 rounded-3xl rounded-tl-none px-6 py-3 max-w-xs">
                <p className="text-slate-800 text-sm font-medium">
                  <AnimatedText delay={0.3}>Can you summarize this?</AnimatedText>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-end"
            >
              <div className="bg-slate-200 rounded-3xl rounded-tr-none px-6 py-3 max-w-xs">
                <p className="text-slate-900 text-sm font-medium">
                  <AnimatedText delay={0.8}>Here's the summary with key points...</AnimatedText>
                </p>
              </div>
            </motion.div>
          </div>

          <div className="max-w-lg text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">
              <AnimatedText delay={1.2}>Natural conversations with your data</AnimatedText>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              <AnimatedText delay={1.5}>Ask questions, get answers, explore insights in real-time.</AnimatedText>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Generate Flashcards",
      description: "Create study materials instantly",
      content: (
        <div className="flex flex-col items-center justify-center h-96 gap-8">
          {/* Unique tab-reveal design */}
          <div className="w-80">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              {/* Top card - question */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl p-6 text-white shadow-lg relative z-10"
              >
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Question</p>
                <p className="text-lg font-bold">
                  <AnimatedText delay={0.5}>What is cross-document synthesis?</AnimatedText>
                </p>
              </motion.div>

              {/* Bottom card - answer with offset */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-3xl p-6 border-2 border-t-0 border-blue-200 shadow-lg relative -mt-4 pt-8 max-h-32 overflow-hidden"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Answer</p>
                <p className="text-slate-700 font-medium text-sm leading-relaxed line-clamp-3">
                  <AnimatedText delay={1.0}>Analyzing multiple documents simultaneously to find patterns, relationships, and unified insights.</AnimatedText>
                </p>
              </motion.div>
            </motion.div>
          </div>

          <div className="max-w-lg text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">
              <AnimatedText delay={1.5}>Interactive study materials</AnimatedText>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              <AnimatedText delay={1.8}>Transform documents into instant flashcards, quizzes, and summaries.</AnimatedText>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Code & More",
      description: "Extract code and generate snippets",
      content: (
        <div className="flex flex-col items-center justify-center h-96 gap-8">
          {/* Code block animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-80 bg-slate-900 rounded-2xl p-4 shadow-2xl font-mono text-sm"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <span className="text-green-400">{'function'}</span>{' '}
                <span className="text-yellow-400">{'analyzeData'}</span>
                <span className="text-white">{'(docs) {'}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="ml-4"
              >
                <span className="text-gray-500">{'// Process...'}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <span className="text-blue-400">{'return'}</span> <span className="text-white">{'insights;'}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <span className="text-white">{'}'}</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="max-w-lg text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">
              <AnimatedText delay={1.3}>Extract code snippets instantly</AnimatedText>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              <AnimatedText delay={1.6}>Get working code examples, implementations, and solutions.</AnimatedText>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Compare & Synthesize",
      description: "The ultimate power of IntelliDocs",
      content: (
        <div className="flex flex-col items-center justify-center h-96 gap-8">
          {/* Document comparison flow */}
          <div className="w-80 space-y-4">
            {/* Document 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Research Paper</p>
                <p className="text-xs text-slate-500">Document A</p>
              </div>
            </motion.div>

            {/* Connection arrow */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex justify-center"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
                <Zap className="w-5 h-5 text-purple-500" />
                <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
              </div>
            </motion.div>

            {/* Document 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Analysis Report</p>
                <p className="text-xs text-slate-500">Document B</p>
              </div>
            </motion.div>

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300"
            >
              <p className="text-sm font-bold text-purple-900 mb-2">Unified Insights</p>
              <p className="text-xs text-purple-800">Compare, contrast & synthesize all your documents</p>
            </motion.div>
          </div>

          <div className="max-w-lg text-center space-y-3">
            <h3 className="text-2xl font-bold text-slate-900">
              <AnimatedText delay={1.2}>Cross-document analysis</AnimatedText>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              <AnimatedText delay={1.5}>Compare multiple documents, find patterns, unlock insights.</AnimatedText>
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    markOnboardingComplete();
  };

  if (!showOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Step {currentStep + 1} of {steps.length}</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{steps[currentStep].title}</h2>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-slate-300">{String(currentStep + 1).padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          {/* Content with fade transition */}
          <div className="px-8 py-8 min-h-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer with Navigation */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-200 disabled:text-slate-400 disabled:bg-transparent disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              {steps.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStep ? 'bg-slate-900 w-8' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg"
                >
                  Let's Get Started
                </button>
                <button
                  onClick={handleGetStarted}
                  className="text-xs text-slate-500 font-medium hover:text-slate-700 transition-all"
                >
                  Skip
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
