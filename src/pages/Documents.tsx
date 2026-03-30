import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesService } from '../services/api';
import { 
  FileText, Trash2, Search, 
  Upload, MoreVertical, Download, 
  Calendar, Database as DatabaseIcon, 
  Edit2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Documents = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.listFiles,
  });

  const deleteFileMutation = useMutation({
    mutationFn: filesService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      showSuccess("Document removed from knowledge base.");
    },
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    try {
      await filesService.uploadFiles(filesToUpload);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      showSuccess("Intelligence assets synchronized.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter((f: any) => 
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-screen bg-white overflow-y-auto custom-scrollbar font-sans select-none pb-40">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-16 animate-fade-in">
        
        {/* HEADER SECTION (32px SemiBold) */}
        <header className="mb-12 border-b border-[#e5e5e5] pb-10">
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="alert-success mb-8 flex items-center gap-3 shadow-premium"
              >
                 <Sparkles className="w-4 h-4" />
                 {successMsg}
              </motion.div>
            )}
          </AnimatePresence>
          <h1 className="text-[32px] font-bold text-black tracking-tight mb-2">Documents</h1>
          <p className="text-[14px] font-normal text-[#666] leading-relaxed">
            Manage your uploaded files and control your knowledge base
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
           <div className="relative group w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a8a8] group-focus-within:text-black transition-colors" />
              <input 
                type="text"
                placeholder="Search knowledge repository..."
                className="pl-11 pr-5 py-3.5 bg-white border border-[#cccccc] rounded-lg w-full text-[14px] font-normal focus:border-black focus:ring-2 focus:ring-[#f0f0f0] outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <input 
             type="file" 
             className="hidden" 
             multiple 
             ref={fileInputRef}
             onChange={(e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); }}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isUploading}
             className="bg-black text-white px-8 py-3.5 rounded-lg flex items-center gap-3 text-[14px] font-semibold hover:bg-[#1a1a1a] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
           >
             <Upload className="w-4.5 h-4.5" />
             Add More Documents
           </button>
        </div>

        {/* DOCUMENT GRID REPOSITORY */}
        <section>
           {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="h-44 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg animate-pulse" />
                 ))}
              </div>
           ) : filteredFiles.length === 0 ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-[#e5e5e5] rounded-xl bg-[#fafafa] space-y-6 cursor-pointer hover:bg-[#f8f8f8] hover:border-[#cccccc] transition-all px-4 text-center"
             >
                <Upload className="w-12 h-12 text-[#d0d0d0]" />
                <div className="space-y-2">
                   <h3 className="text-[20px] font-bold text-black tracking-tight">No documents yet</h3>
                   <p className="text-[14px] font-normal text-[#666]">Upload your first document to get started</p>
                </div>
                <button className="bg-black text-white px-10 py-3.5 rounded-lg font-semibold text-[14px]">
                   Upload Document
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence>
                 {filteredFiles.map((file: any) => (
                   <motion.div
                     layout
                     key={file.id}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     whileHover={{ borderColor: '#10A37F', boxShadow: '0 8px 16px rgba(16, 163, 127, 0.08)' }}
                     className="group bg-white border border-[#e5e5e5] border-l-[3.5px] border-l-[#10A37F] rounded-lg p-5 flex flex-col justify-between transition-all relative overflow-visible shadow-sm"
                   >
                     {/* CARD HEADER (Icon & Menu Button) */}
                     <div className="flex items-start justify-between mb-8">
                       <div className="w-12 h-12 bg-[#f8f8f8] rounded-xl flex items-center justify-center text-[#666]">
                          <FileText className="w-8 h-8" />
                       </div>
                       
                       <div className="relative">
                          <button 
                            onClick={() => setMenuId(menuId === file.id ? null : file.id)}
                            className="p-1 px-1.5 md:opacity-0 group-hover:opacity-100 text-[#a8a8a8] hover:text-black hover:bg-[#f0f0f0] rounded-md transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* CONTEXT MENU */}
                          <AnimatePresence>
                             {menuId === file.id && (
                               <motion.div
                                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 className="absolute right-0 top-10 bg-white border border-[#e5e5e5] shadow-premium rounded-lg z-[100] min-w-[160px] py-1.5 overflow-hidden"
                               >
                                  <button className="w-full text-left px-4 py-2.5 text-[14px] text-[#333] hover:bg-[#f0f0f0] flex items-center gap-3">
                                     <Download className="w-4 h-4" /> Download
                                  </button>
                                  <button className="w-full text-left px-4 py-2.5 text-[14px] text-[#333] hover:bg-[#f0f0f0] flex items-center gap-3">
                                     <Edit2 className="w-4 h-4" /> Rename
                                  </button>
                                  <button 
                                    onClick={() => deleteFileMutation.mutate(file.id)}
                                    className="w-full text-left px-4 py-3 text-[14px] text-[#dc3545] border-t border-[#e5e5e5] hover:bg-[#fee] flex items-center gap-3 transition-colors mt-1"
                                  >
                                     <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                               </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                     </div>

                     {/* CARD FOOTER (Filename & Meta) */}
                     <div className="space-y-4">
                        <h3 className="text-[14px] font-bold text-black leading-snug line-clamp-2 pr-2">
                           {file.filename}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center gap-2 text-[12px] font-medium text-[#a8a8a8]">
                              <DatabaseIcon className="w-3.5 h-3.5" />
                              Synced Context
                           </div>
                           <div className="flex items-center gap-2 text-[12px] font-medium text-[#d0d0d0]">
                              <Calendar className="w-3.5 h-3.5" />
                              March 30, 2026
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
        </section>

        <footer className="mt-40 border-t border-[#f0f0f0] pt-10 flex items-center justify-center opacity-30">
           <div className="text-[11px] font-bold text-black uppercase tracking-widest">
             IntelliDocs Production Asset Hub
           </div>
        </footer>
      </div>
    </div>
  );
};
