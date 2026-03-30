import { useState, useEffect } from 'react';
import { FileText, Loader2, Database, Trash2, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesService } from '../services/api';
import { useAppError } from '../context/ErrorContext';

export const Files = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setError: setGlobalError } = useAppError();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await filesService.listFiles();
      setFiles(data);
    } catch (err) {
      setGlobalError({
        title: "Connection failure",
        description: "We couldn't load your documents. Please refresh the page.",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await filesService.deleteFile(id);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      setGlobalError({
        title: "Delete failed",
        description: "We couldn't remove that file. Please try again.",
        type: 'error'
      });
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full font-sans overflow-hidden">

      {/* Header Bar */}
      <div className="h-20 border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Documents</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">Manage your study materials here</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            multiple
            accept=".txt"
            className="hidden"
            id="file-upload"
            onChange={async (e) => {
              if (e.target.files?.length) {
                try {
                  setLoading(true);
                  await filesService.uploadFiles(Array.from(e.target.files));
                  fetchFiles();
                } catch (err) {
                  setGlobalError({ title: "Upload error", description: "Failed to upload. Use .txt files.", type: 'error' });
                } finally {
                  setLoading(false);
                }
              }
            }}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Add Documents
          </label>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {loading && files.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-bold text-slate-400">Loading your files...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {files.map((file) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={file.id}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:bg-white transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] text-[15px]" title={file.filename}>
                      {file.filename}
                    </h3>

                    <div className="flex items-center justify-between border-t border-slate-200/40 pt-4">
                      {file.status === 'ready' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Ready to use</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-blue-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Reading...</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
              <Database className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Your document list is empty</h2>
            <p className="text-slate-500 font-medium max-w-xs">Upload some study notes or documents to start your AI learning session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
