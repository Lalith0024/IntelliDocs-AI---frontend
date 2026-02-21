import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Files } from './pages/Files';
import { Analytics } from './pages/Analytics';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/files" element={<Files />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#fafbfc] flex flex-col selection:bg-blue-100">
          <Header />
          <main className="flex-1 pt-16 flex flex-col">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
