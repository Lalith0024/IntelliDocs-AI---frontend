import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../components/BrandLogo';

export const Login = () => {
  const [isSignUP, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSignUP) {
        const data = await authService.login(email, password);
        await login(data.access_token);
      } else {
        await authService.signup(email, password);
        const data = await authService.login(email, password);
        await login(data.access_token);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#1a73e8 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Left Side: Brand & Messaging (Kept from User Preference) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[18px] flex items-center justify-center shadow-2xl shadow-slate-100 border border-slate-50">
              <BrandLogo className="w-10 h-10" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Intellidocs AI</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
              Ask anything from <span className="text-blue-600">your docs!</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-lg">
              The ultimate AI-first workspace for high-stakes research.
              Upload complex reports, spreadsheets, or manuals and get instant intelligence with enterprise-grade accuracy.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Private</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure Storage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Universal</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">All Formats</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Clean, High-End Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[460px] mx-auto lg:ml-auto"
        >
          <div className="bg-white rounded-[48px] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100/50">

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isSignUP ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-400 font-bold text-[11px] mt-4 uppercase tracking-[0.2em] opacity-60">
                {isSignUP ? 'BUILD YOUR INTELLIGENT WORKSPACE' : 'ENTER YOUR DOCUMENT LIBRARY'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-[11px] font-black rounded-2xl border border-red-100 text-center uppercase tracking-widest leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Workspace Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-[15px] font-bold text-slate-900 shadow-sm placeholder:text-slate-200"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-[15px] font-bold text-slate-900 shadow-sm placeholder:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center h-16 bg-slate-900 text-white rounded-[24px] text-[13px] font-black uppercase tracking-[0.3em] transition-all hover:bg-blue-600 shadow-xl shadow-slate-100 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <BrandLogo className="w-8 h-8 filter brightness-0 invert" />
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-3">
                    {isSignUP ? 'Signup' : 'Login'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUP);
                  setError(null);
                }}
                className="text-[11px] font-black text-slate-400 uppercase tracking-widest transition-all active:scale-95"
              >
                {isSignUP ? (
                  <>Already have an account? <span className="text-blue-600 underline underline-offset-4 ml-1">Sign in</span></>
                ) : (
                  <>No account? <span className="text-blue-600 underline underline-offset-4 ml-1">Create one</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-10 left-10 text-slate-300 font-bold text-[9px] uppercase tracking-[0.4em] z-10 opacity-40">
        Intellidocs AI Labs • All Rights Reserved
      </footer>
    </div>
  );
};
