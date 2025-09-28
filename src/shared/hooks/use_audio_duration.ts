import { useEffect, useState } from 'react';

export function useAudioDuration(audioSrc: string | null) {
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioSrc) {
      setDuration(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const audio = new Audio();
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleError = () => {
      setError('Не удалось загрузить аудио');
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    
    audio.src = audioSrc;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [audioSrc]);

  return { duration, loading, error };
}
