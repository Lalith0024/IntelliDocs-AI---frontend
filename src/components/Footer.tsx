export const Footer = () => {
  return (
    <footer className="mt-auto py-12 px-8 border-t border-slate-200/50 bg-slate-50/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">ID</div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">IntelliDocs AI</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Intelligent Document Analysis & Search
          </p>
        </div>

        <div className="flex gap-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-blue-600 transition-colors">API Docs</a>
        </div>

        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          © {new Date().getFullYear()} IntelliDocs
        </div>
      </div>
    </footer>
  );
};
