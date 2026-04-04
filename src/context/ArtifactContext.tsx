import { createContext, useContext, useState, type ReactNode } from 'react';

interface Artifact {
  type: string;
  data: any;
}

interface ArtifactContextType {
  activeArtifact: Artifact | null;
  setActiveArtifact: (artifact: Artifact | null) => void;
}

const ArtifactContext = createContext<ArtifactContextType | undefined>(undefined);

export const ArtifactProvider = ({ children }: { children: ReactNode }) => {
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);

  return (
    <ArtifactContext.Provider value={{ activeArtifact, setActiveArtifact }}>
      {children}
    </ArtifactContext.Provider>
  );
};

export const useArtifact = () => {
  const context = useContext(ArtifactContext);
  if (context === undefined) {
    throw new Error('useArtifact must be used within an ArtifactProvider');
  }
  return context;
};
