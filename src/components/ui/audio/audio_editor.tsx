import { Button } from "@/components/ui/base";
import { Input, Label } from "@/components/ui/form";
import {
  MousePointer,
  Pause,
  Play,
  PlayCircle,
  SkipBack,
  SkipForward,
  Volume2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface AudioEditorProps {
  audioUrl: string;
  onSave: (startTime: number, endTime: number) => void;
  onClose: () => void;
  initialStartTime?: number;
  initialEndTime?: number;
}

export const AudioEditor = ({
  audioUrl,
  onSave,
  onClose,
  initialStartTime = 0,
  initialEndTime,
}: AudioEditorProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime || 0);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState<
    "start" | "end" | "range" | "seek" | null
  >(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [followMode, setFollowMode] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Останавливаем воспроизведение при открытии редактора
    audio.pause();
    setIsPlaying(false);

    // Устанавливаем начальную громкость
    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Устанавливаем endTime только если он не был передан извне
      if (!initialEndTime) {
        setEndTime(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
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
    };
  }, [audioUrl, volume]);

  // Останавливаем воспроизведение при изменении URL аудио
  useEffect(() => {
    setIsPlaying(false);

    // Cleanup: останавливаем воспроизведение при размонтировании компонента
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, [audioUrl]);

  // Обновляем состояние при изменении начальных значений
  useEffect(() => {
    setStartTime(initialStartTime);
    if (initialEndTime) {
      setEndTime(initialEndTime);
    }
  }, [initialStartTime, initialEndTime]);

  // Останавливаем воспроизведение при включении режима следования
  useEffect(() => {
    if (followMode) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
    }
  }, [followMode]);

  // Обработчики для перетаскивания ползунков
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, endTime, startTime, duration]);

  // Обработчик для режима следования ползунка за курсором
  useEffect(() => {
    if (followMode) {
      const handleMouseMoveFollow = (event: MouseEvent) => {
        if (!progressRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const mouseX = event.clientX;

        // Проверяем, что курсор находится над прогресс-баром
        if (mouseX >= rect.left && mouseX <= rect.right) {
          const clickX = mouseX - rect.left;
          const percentage = clickX / rect.width;
          const newTime = percentage * duration;
          const clampedTime = Math.max(0, Math.min(newTime, duration));

          // Обновляем визуальное состояние сразу для плавности
          setCurrentTime(clampedTime);

          // Тротлированно обновляем позицию аудио
          throttledHandleSeek(clampedTime);
        }
      };

      const handleClickOutside = (event: MouseEvent) => {
        // Проверяем, что клик не по кнопке режима следования
        const target = event.target as HTMLElement;
        if (target.closest('button[data-seek-mode-button="true"]')) {
          return;
        }

        // Фиксируем позицию на текущем месте и выключаем режим
        setFollowMode(false);
      };

      document.addEventListener("mousemove", handleMouseMoveFollow);
      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("mousemove", handleMouseMoveFollow);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [followMode, duration]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

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
  };

  const playFromStart = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Устанавливаем позицию на начало обрезки
      audio.currentTime = startTime;
      await audio.play();
    } catch (error) {
      console.error("Error playing from start:", error);
      setIsPlaying(false);
    }
  };

  const playSelection = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Устанавливаем позицию на начало обрезки
      audio.currentTime = startTime;
      await audio.play();

      // Автоматически останавливаем в конце выбранного фрагмента
      const checkEnd = () => {
        if (audio.currentTime >= endTime) {
          audio.pause();
          audio.currentTime = startTime;
          setIsPlaying(false);
        }
      };

      // Добавляем временный обработчик
      audio.addEventListener("timeupdate", checkEnd);

      // Удаляем обработчик после остановки
      const removeHandler = () => {
        audio.removeEventListener("timeupdate", checkEnd);
        audio.removeEventListener("pause", removeHandler);
        audio.removeEventListener("ended", removeHandler);
      };

      audio.addEventListener("pause", removeHandler);
      audio.addEventListener("ended", removeHandler);
    } catch (error) {
      console.error("Error playing selection:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Тротлированная версия handleSeek для режима следования
  const throttledHandleSeek = useCallback(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (time: number) => {
      if (timeoutId) return; // Игнорируем вызовы, если уже запланирован обновление

      timeoutId = setTimeout(() => {
        handleSeek(time);
        timeoutId = null;
      }, 16); // ~60 FPS
    };
  }, [handleSeek])();

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    if (followMode) {
      // В режиме следования фиксируем позицию и выключаем режим
      handleSeek(newTime);
      setFollowMode(false);
    } else {
      // В обычном режиме просто перемещаем позицию воспроизведения
      handleSeek(newTime);
    }
  };

  const getTimeFromPosition = (clientX: number) => {
    if (!progressRef.current || !duration) return 0;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return percentage * duration;
  };

  const handleMouseDown =
    (type: "start" | "end") => (event: React.MouseEvent) => {
      event.preventDefault();
      setIsDragging(type);
    };

  const handleRangeMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();

    // В режиме следования фиксируем позицию и выключаем режим
    if (followMode) {
      const clickTime = getTimeFromPosition(event.clientX);
      handleSeek(clickTime);
      setFollowMode(false);
      return;
    }

    const clickTime = getTimeFromPosition(event.clientX);
    setDragOffset(clickTime - startTime);
    setIsDragging("range");
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !duration) return;

      const newTime = getTimeFromPosition(event.clientX);

      if (isDragging === "start") {
        const clampedTime = Math.max(0, Math.min(newTime, endTime - 0.1));
        setStartTime(clampedTime);
      } else if (isDragging === "end") {
        const clampedTime = Math.max(newTime, startTime + 0.1);
        setEndTime(Math.min(clampedTime, duration));
      } else if (isDragging === "range") {
        const rangeDuration = endTime - startTime;
        const newStartTime = Math.max(
          0,
          Math.min(newTime - dragOffset, duration - rangeDuration)
        );
        const newEndTime = newStartTime + rangeDuration;

        setStartTime(newStartTime);
        setEndTime(newEndTime);
      } else if (isDragging === "seek") {
        // Перетаскивание ползунка воспроизведения
        const clampedTime = Math.max(0, Math.min(newTime, duration));
        throttledHandleSeek(clampedTime);
      }
    },
    [isDragging, duration, endTime, startTime, dragOffset, throttledHandleSeek]
  );

  const handleMouseUp = () => {
    setIsDragging(null);
    // Не выключаем режим, если мы не в режиме перетаскивания
    if (isDragging) {
      setFollowMode(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(newVolume);
    audio.volume = newVolume;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSave = () => {
    onSave(startTime, endTime);
    onClose();
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const startPercentage = duration ? (startTime / duration) * 100 : 0;
  const endPercentage = duration ? (endTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      <DialogTitle>Редактор аудио</DialogTitle>
      {/* Audio Player */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
            title="Назад на 10 сек"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={playFromStart}
            title="Воспроизвести с начала обрезки"
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={playSelection}
            title="Воспроизвести только выбранный фрагмент"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            title={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
            title="Вперед на 10 сек"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <Volume2 className="h-4 w-4" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              type="button"
              variant={followMode ? "destructive" : "outline"}
              size="sm"
              data-seek-mode-button="true"
              onClick={() => {
                if (!followMode) {
                  // Включаем режим следования
                  setFollowMode(true);
                } else {
                  // Выключаем режим
                  setFollowMode(false);
                }
              }}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            ref={progressRef}
            className={`relative h-2 bg-muted rounded-full ${
              followMode ? "cursor-default" : "cursor-pointer"
            }`}
            onClick={handleProgressClick}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-muted rounded-full" />

            {/* Selected range */}
            <div
              className={`absolute h-full bg-primary/30 rounded-full hover:bg-primary/40 transition-colors ${
                followMode
                  ? "cursor-default"
                  : startTime > 0 || endTime < duration
                  ? "cursor-move"
                  : "cursor-pointer"
              }`}
              style={{
                left: `${startPercentage}%`,
                width: `${endPercentage - startPercentage}%`,
              }}
              onMouseDown={handleRangeMouseDown}
            />

            {/* Current time indicator */}
            <div
              className="absolute top-0 h-full w-1 bg-primary rounded-full"
              style={{ left: `${progressPercentage}%` }}
            />

            {/* Start time handle */}
            <div
              className={`absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform ${
                followMode ? "cursor-default" : "cursor-pointer"
              } ${
                isDragging === "start"
                  ? "bg-primary scale-110 shadow-lg"
                  : "bg-primary"
              }`}
              style={{ left: `${startPercentage}%` }}
              onMouseDown={handleMouseDown("start")}
              title={`Начало: ${formatTime(startTime)}`}
            />

            {/* End time handle */}
            <div
              className={`absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 hover:scale-110 transition-transform ${
                followMode ? "cursor-default" : "cursor-pointer"
              } ${
                isDragging === "end"
                  ? "bg-primary scale-110 shadow-lg"
                  : "bg-primary"
              }`}
              style={{ left: `${endPercentage}%` }}
              onMouseDown={handleMouseDown("end")}
              title={`Конец: ${formatTime(endTime)}`}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Начало (сек)</Label>
          <Input
            type="number"
            value={startTime.toFixed(1)}
            onChange={(e) => setStartTime(Number(e.target.value))}
            min={0}
            max={endTime}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label>Конец (сек)</Label>
          <Input
            type="number"
            value={endTime.toFixed(1)}
            onChange={(e) => setEndTime(Number(e.target.value))}
            min={startTime}
            max={duration}
            step={0.1}
          />
        </div>
      </div>

      {/* Duration Info */}
      <div className="text-sm text-muted-foreground space-y-0.5">
        {initialStartTime > 0 || initialEndTime ? (
          <p className="text-xs text-primary">
            ✓ Загружены сохраненные настройки обрезки
          </p>
        ) : null}
        <p>Общая длительность: {formatTime(duration)}</p>
        <p>Выбранный фрагмент: {formatTime(endTime - startTime)}</p>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      <DialogFooter className="flex gap-2">
        <Button onClick={handleSave} size="sm">
          Сохранить обрезку
        </Button>
        <Button onClick={onClose} variant="outline" size="sm">
          Отмена
        </Button>
      </DialogFooter>
    </div>
  );
};
