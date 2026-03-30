import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Loader2, X, Clock } from 'lucide-react';
import { cn } from '../utils/cn';
import type { SearchHistoryItem } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('search_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (q: string) => {
    if (!q.trim()) return;
    const newHistory = [
      { id: Date.now().toString(), question: q, timestamp: Date.now() },
      ...history.filter(h => h.question !== q).slice(0, 4)
    ];
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
      saveToHistory(query);
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full z-[50]">
      <div className={cn(
        "relative transition-all duration-300 rounded-[2rem]",
        isFocused ? "scale-[1.01] shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/20" : "shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60"
      )}>
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex items-center h-16 sm:h-20 px-6 sm:px-8 rounded-[2rem] bg-white transition-colors",
            isFocused ? "bg-white" : "bg-white"
          )}
        >
          <div className="flex-shrink-0 mr-4 sm:mr-6">
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
            ) : (
              <Search className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300",
                isFocused ? "text-blue-600" : "text-slate-400"
              )} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (history.length > 0) setShowHistory(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding history to allow clicks
              setTimeout(() => setShowHistory(false), 200);
            }}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent border-none outline-none text-lg sm:text-xl font-medium tracking-tight h-full text-slate-800 placeholder:text-slate-300"
          />

          <div className="flex items-center gap-3 ml-4">
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={cn(
                "hidden sm:flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
                query.trim() && !isLoading
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <span>Search</span>
              {query.trim() && !isLoading && <CornerDownLeft className="w-3 h-3" />}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 12 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.1 } }}
            className="absolute top-full left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="px-6 py-3 border-b border-slate-100/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Recent Searches
              </span>
            </div>
            <div className="py-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    setQuery(item.question);
                    onSearch(item.question);
                    setShowHistory(false);
                  }}
                  className="w-full flex items-center px-6 py-3.5 hover:bg-blue-50/50 text-left transition-colors group"
                >
                  <Clock className="w-4 h-4 mr-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 truncate">
                    {item.question}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
