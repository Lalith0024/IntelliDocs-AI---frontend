import { createContext, useContext, useState, type ReactNode } from 'react';

interface ErrorMessage {
  title: string;
  description: string;
  type?: 'warning' | 'error' | 'info';
}

interface ErrorContextType {
  error: ErrorMessage | null;
  setError: (error: ErrorMessage | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setGlobalError] = useState<ErrorMessage | null>(null);

  const setError = (err: ErrorMessage | null) => {
    setGlobalError(err);
    if (err) {
      // Auto clear persistent errors after 10 seconds if they aren't critical
      if (err.type !== 'error') {
        setTimeout(() => setGlobalError(null), 10000);
      }
    }
  };

  const clearError = () => setGlobalError(null);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useAppError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useAppError must be used within an ErrorProvider');
  }
  return context;
};
