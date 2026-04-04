import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Documents } from './pages/Documents';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { ArtifactProvider } from './context/ArtifactContext';
import { Loader2 } from 'lucide-react';
import './App.css';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <p className="text-sm font-medium text-black/40 uppercase tracking-widest animate-pulse">
            Initializing Neural Intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden text-black font-sans relative">
      {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {user && <Header onToggleSidebar={() => setIsSidebarOpen(true)} />}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/login" element={<Login mode="login" />} />
            <Route path="/signup" element={<Login mode="signup" />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AuthProvider>
          <ArtifactProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ArtifactProvider>
        </AuthProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}

export default App;
