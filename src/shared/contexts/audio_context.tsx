import type { ReactNode } from "react";
import { createContext, useContext, useRef, useState } from "react";

interface AudioContextType {
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
  pauseAll: () => void;
  audioRefs: React.RefObject<Map<string, HTMLAudioElement>>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const pauseAll = (exceptId?: string) => {
    audioRefs.current.forEach((audio, id) => {
      if (!audio.paused && id !== exceptId) {
        audio.pause();
      }
    });
  };

  const handleSetCurrentPlayingId = (id: string | null) => {
    // Если запускается новый трек, останавливаем все остальные
    if (id && id !== currentPlayingId) {
      pauseAll(id);
    }
    setCurrentPlayingId(id);
  };

  return (
    <AudioContext.Provider
      value={{
        currentPlayingId,
        setCurrentPlayingId: handleSetCurrentPlayingId,
        pauseAll,
        audioRefs,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
