import { createContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  markOnboardingComplete: () => void;
  isOnboardingComplete: boolean;
  triggerOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const getInitialOnboardingState = () => {
  const completed = localStorage.getItem('onboarding_complete');
  return {
    isComplete: !!completed,
    shouldShow: !completed
  };
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialOnboardingState();
  const [showOnboarding, setShowOnboarding] = useState(false); // Start with false, don't auto-show
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(initialState.isComplete);
  const { user } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  // When user changes, update their completion status but DON'T auto-trigger onboarding
  useEffect(() => {
    if (!user) {
      // Clear ref when user logs out
      lastUserIdRef.current = null;
      return;
    }
    
    if (user.id !== lastUserIdRef.current) {
      // New user logged in - check if THEY have completed onboarding
      const completed = localStorage.getItem(`onboarding_complete_${user.id}`);
      const hasCompleted = !!completed;
      
      lastUserIdRef.current = user.id;
      setIsOnboardingComplete(hasCompleted);
      // Don't auto-show - let Login component control it via triggerOnboarding()
    }
  }, [user]);

  const markOnboardingComplete = useCallback(() => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    }
    setShowOnboarding(false);
    setIsOnboardingComplete(true);
  }, [user]);

  const triggerOnboarding = useCallback(() => {
    if (!isOnboardingComplete) {
      setShowOnboarding(true);
    }
  }, [isOnboardingComplete]);

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding, markOnboardingComplete, isOnboardingComplete, triggerOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};
