import { Button } from "@/components/ui/button";
import { useAudioContext } from "@/shared/contexts/audio_context";
import { cn } from "@/shared/utils";
import { Pause, Play, Volume2 } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface AudioPreviewProps {
  audioSrc: string;
  className?: string;
  showControls?: boolean;
  audioId?: string; // Уникальный ID для этого аудио
  onTimeUpdate?: (currentTime: number) => void; // Callback для обновления времени
  onReset?: () => void; // Callback для сброса времени
}

export interface AudioPreviewRef {
  resetTime: () => void;
}

export const AudioPreview = forwardRef<AudioPreviewRef, AudioPreviewProps>(
  (
    {
      audioSrc,
      className,
      showControls = true,
      audioId,
      onTimeUpdate,
      onReset,
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);

    const { currentPlayingId, setCurrentPlayingId, audioRefs } =
      useAudioContext();

    // Генерируем уникальный ID если не передан
    const uniqueId =
      audioId || `audio-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      audioRefs.current.set(uniqueId, audio);

      // Устанавливаем начальную громкость
      audio.volume = volume;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };

      const handlePlay = () => {
        setIsPlaying(true);
        setCurrentPlayingId(uniqueId);
      };

      const handlePause = () => {
        setIsPlaying(false);
        if (currentPlayingId === uniqueId) {
          setCurrentPlayingId(null);
        }
      };

      const handleError = (e: Event) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("error", handleError);

        // Удаляем из глобального контекста при размонтировании
        audioRefs.current.delete(uniqueId);
      };
    }, [
      audioSrc,
      volume,
      uniqueId,
      setCurrentPlayingId,
      currentPlayingId,
      audioRefs,
    ]);

    // Отслеживаем изменения глобального состояния воспроизведения
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      // Если играет другой трек, останавливаем этот
      if (currentPlayingId !== null && currentPlayingId !== uniqueId) {
        if (!audio.paused) {
          audio.pause();
          setIsPlaying(false);
        }
      }
    }, [currentPlayingId, uniqueId]);

    const togglePlayPause = useCallback(async () => {
      const audio = audioRef.current;
      if (!audio || !audioSrc) return;

      try {
        if (isPlaying) {
          audio.pause();
        } else {
          await audio.play();
        }
      } catch (error) {
        console.error("Error toggling playback:", error);
        setIsPlaying(false);
      }
    }, [isPlaying, audioSrc, uniqueId]);

    const handleVolumeChange = useCallback((newVolume: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      setVolume(newVolume);
      audio.volume = newVolume;
    }, []);

    const resetTime = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = 0;
      setCurrentTime(0);
      onReset?.();
    }, [onReset]);

    useImperativeHandle(
      ref,
      () => ({
        resetTime,
      }),
      [resetTime]
    );

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!audioSrc) {
      return (
        <div
          className={cn(
            "flex items-center gap-2 text-muted-foreground",
            className
          )}
        >
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <Volume2 className="h-4 w-4" />
          </div>
          <span className="text-sm">Нет аудио</span>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          className="w-8 h-8 p-0"
          disabled={!audioSrc}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {showControls && (
          <>
            <div className="flex-1 min-w-0">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-12 h-1"
              />
            </div>
          </>
        )}

        <audio ref={audioRef} src={audioSrc} preload="metadata" />
      </div>
    );
  }
);

AudioPreview.displayName = "AudioPreview";
