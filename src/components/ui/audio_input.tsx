import { AudioEditor } from "@/components/ui/audio_editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/shared/utils";
import * as lamejs from "lamejs";
import { Edit3, Pause, Play, RefreshCw, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AudioInputProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
  placeholder?: string;
  onEditorOpen?: () => void;
  onTrimProgress?: (progress: number) => void;
}

export const AudioInput = ({
  value,
  onChange,
  onFileChange,
  className,
  placeholder = "Выберите аудио файл...",
  onEditorOpen,
  onTrimProgress,
}: AudioInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(value || null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimSettings, setTrimSettings] = useState<{
    startTime: number;
    endTime: number;
  } | null>(null);

  useEffect(() => {
    setAudioUrl(value || null);
  }, [value]);

  const audioBufferToMp3WithMediaRecorder = useCallback(
    async (buffer: AudioBuffer): Promise<Blob> => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);

      // Пытаемся использовать лучший доступный кодек
      let mimeType = "audio/webm;codecs=opus"; // лучший fallback
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/mpeg")) {
        mimeType = "audio/mpeg";
      }

      console.log("Используем MediaRecorder с типом:", mimeType);
      const mediaRecorder = new MediaRecorder(dest.stream, { mimeType });

      return new Promise((resolve, reject) => {
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        };

        mediaRecorder.onerror = reject;

        mediaRecorder.start();
        source.start();

        // Останавливаем запись через длительность буфера
        const duration = buffer.duration * 1000; // в миллисекундах
        setTimeout(() => {
          mediaRecorder.stop();
          source.stop();
        }, duration + 100); // добавляем небольшую задержку
      });
    },
    []
  );

  const audioBufferToMp3 = useCallback((buffer: AudioBuffer): Blob => {
    console.log("Начинаем MP3 кодирование...");
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;

    console.log("Параметры аудио:", { sampleRate, numberOfChannels, length });

    // Используем оригинальные параметры - ваш форк должен их поддерживать
    console.log("Используем параметры:", {
      numberOfChannels,
      sampleRate,
      bitrate: 128,
    });

    // Создаем массив для левого и правого каналов
    const leftChannel = new Int16Array(length);
    const rightChannel = new Int16Array(length);

    // Конвертируем float32 в int16
    for (let i = 0; i < length; i++) {
      leftChannel[i] = Math.max(
        -32768,
        Math.min(32767, buffer.getChannelData(0)[i] * 32768)
      );

      if (numberOfChannels > 1) {
        rightChannel[i] = Math.max(
          -32768,
          Math.min(32767, buffer.getChannelData(1)[i] * 32768)
        );
      } else {
        rightChannel[i] = leftChannel[i]; // Моно в стерео
      }
    }

    // Проверяем, что lamejs доступен
    console.log("Проверяем lamejs:", lamejs);
    if (!lamejs || !lamejs.Mp3Encoder) {
      throw new Error("lamejs не загружен или Mp3Encoder недоступен");
    }

    // Ваш форк lamejs должен работать без глобальных переменных

    // Создаем MP3 энкодер
    console.log("Создаем MP3 энкодер...");
    const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, 128); // 128 kbps
    console.log("MP3 энкодер создан успешно");
    const mp3Data: Int8Array[] = [];

    // Кодируем по блокам
    const blockSize = 1152; // Стандартный размер блока для MP3
    console.log("Начинаем кодирование по блокам, размер блока:", blockSize);

    for (let i = 0; i < length; i += blockSize) {
      const leftChunk = leftChannel.subarray(i, i + blockSize);
      const rightChunk = rightChannel.subarray(i, i + blockSize);

      try {
        const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
        console.log(
          `Закодирован блок ${i / blockSize + 1}/${Math.ceil(
            length / blockSize
          )}, размер: ${mp3buf.length}`
        );
      } catch (error) {
        console.error(`Ошибка кодирования блока ${i / blockSize + 1}:`, error);
        throw error;
      }
    }

    console.log("Кодирование завершено, блоков:", mp3Data.length);

    // Завершаем кодирование
    console.log("Завершаем кодирование...");
    const finalMp3buf = mp3encoder.flush();
    if (finalMp3buf.length > 0) {
      mp3Data.push(finalMp3buf);
    }

    // Объединяем все блоки
    const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
    console.log("Общий размер MP3:", totalLength, "байт");

    const mp3Buffer = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of mp3Data) {
      mp3Buffer.set(chunk, offset);
      offset += chunk.length;
    }

    const blob = new Blob([mp3Buffer], { type: "audio/mpeg" });
    console.log("MP3 Blob создан, размер:", blob.size, "байт");
    return blob;
  }, []);

  const processFile = useCallback(
    (file: File) => {
      // Проверяем, что это аудио файл
      if (!file.type.startsWith("audio/")) {
        alert("Пожалуйста, выберите аудио файл");
        return;
      }

      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioFile(file);
      setOriginalFile(file); // Сохраняем оригинальный файл
      onChange?.(url);
      if (onFileChange) {
        onFileChange(file);
      }
    },
    [onChange, onFileChange]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioFile(null);
    setOriginalFile(null);
    onChange?.(null);
    onFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [audioUrl, onChange, onFileChange]);

  const trimAudioFile = useCallback(
    async (file: File, startTime: number, endTime: number): Promise<File> => {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.addEventListener("loadedmetadata", () => {
          const duration = audio.duration;
          const start = Math.max(0, startTime);
          const end = Math.min(duration, endTime);

          // Создаем новый аудио контекст для обрезки
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();

          // Загружаем аудио данные
          fetch(url)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
            .then((audioBuffer) => {
              // Создаем обрезанный буфер
              const startSample = Math.floor(start * audioBuffer.sampleRate);
              const endSample = Math.floor(end * audioBuffer.sampleRate);
              const length = endSample - startSample;

              const trimmedBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                length,
                audioBuffer.sampleRate
              );

              // Копируем данные
              for (
                let channel = 0;
                channel < audioBuffer.numberOfChannels;
                channel++
              ) {
                const channelData = audioBuffer.getChannelData(channel);
                const trimmedData = trimmedBuffer.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                  trimmedData[i] = channelData[startSample + i];
                }
              }

              // Конвертируем обратно в файл, сохраняя оригинальный формат
              audioBufferToFile(trimmedBuffer, file)
                .then((trimmedFile) => {
                  URL.revokeObjectURL(url);
                  resolve(trimmedFile);
                })
                .catch((error) => {
                  reject(error);
                });
            })
            .catch(reject);
        });

        audio.addEventListener("error", reject);
        audio.src = url;
      });
    },
    []
  );

  const validateAudioFile = useCallback(
    async (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        console.log(
          "Валидируем файл:",
          file.name,
          "размер:",
          file.size,
          "тип:",
          file.type
        );
        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.addEventListener("loadedmetadata", () => {
          console.log("Файл валиден, длительность:", audio.duration);
          URL.revokeObjectURL(url);
          resolve(true);
        });

        audio.addEventListener("error", (e) => {
          console.error("Ошибка валидации файла:", e);
          URL.revokeObjectURL(url);
          resolve(false);
        });

        audio.src = url;
      });
    },
    []
  );

  const audioBufferToFile = useCallback(
    async (buffer: AudioBuffer, originalFile: File): Promise<File> => {
      // Определяем формат на основе оригинального файла
      const originalType = originalFile.type;
      const originalName = originalFile.name;

      // Если это MP3, пытаемся сохранить как MP3
      if (
        originalType.includes("mp3") ||
        originalType.includes("mpeg") ||
        originalName.toLowerCase().endsWith(".mp3")
      ) {
        onTrimProgress?.(20); // 20% - начало кодирования
        try {
          console.log("Пытаемся кодировать в MP3 через lamejs...");
          const mp3Blob = audioBufferToMp3(buffer);
          console.log("MP3 кодирование успешно, размер:", mp3Blob.size, "байт");

          const trimmedFile = new File(
            [mp3Blob],
            originalName.replace(/\.[^/.]+$/, "_trimmed.mp3"),
            { type: "audio/mpeg" }
          );

          // Проверяем качество созданного файла
          const isValid = await validateAudioFile(trimmedFile);
          if (isValid) {
            console.log("MP3 файл валиден, используем его");
            return trimmedFile;
          } else {
            console.log("MP3 файл невалиден, переходим к MediaRecorder");
          }
        } catch (error) {
          console.error("Ошибка MP3 кодирования:", error);
          console.log("Пробуем MediaRecorder как fallback...");

          try {
            const mediaRecorderBlob = await audioBufferToMp3WithMediaRecorder(
              buffer
            );
            console.log(
              "MediaRecorder кодирование успешно, размер:",
              mediaRecorderBlob.size,
              "байт"
            );

            const trimmedFile = new File(
              [mediaRecorderBlob],
              originalName.replace(/\.[^/.]+$/, "_trimmed.webm"),
              { type: "audio/webm" }
            );

            const isValid = await validateAudioFile(trimmedFile);
            if (isValid) {
              console.log("MediaRecorder файл валиден, используем его");
              return trimmedFile;
            }
          } catch (mediaRecorderError) {
            console.error("Ошибка MediaRecorder:", mediaRecorderError);
          }
        }

        // Пропускаем MediaRecorder и сразу переходим к WAV
      }

      // Fallback: создаем WAV файл
      onTrimProgress?.(40); // 40% - WAV кодирование
      const length = buffer.length;
      const numberOfChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(arrayBuffer);

      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, length * numberOfChannels * 2, true);

      // Audio data
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(
            -1,
            Math.min(1, buffer.getChannelData(channel)[i])
          );
          view.setInt16(
            offset,
            sample < 0 ? sample * 0x8000 : sample * 0x7fff,
            true
          );
          offset += 2;
        }
      }

      const wavBlob = new Blob([arrayBuffer], { type: "audio/wav" });
      const wavFile = new File(
        [wavBlob],
        originalName.replace(/\.[^/.]+$/, "_trimmed.wav"),
        { type: "audio/wav" }
      );

      onTrimProgress?.(70); // 70% - валидация

      // Проверяем качество WAV файла
      const isValid = await validateAudioFile(wavFile);
      if (isValid) {
        onTrimProgress?.(100); // 100% - готово
        return wavFile;
      }

      // Если WAV тоже не работает, возвращаем оригинальный файл
      return originalFile;
    },
    []
  );

  const handleEdit = useCallback(
    (startTime: number, endTime: number) => {
      // Сохраняем настройки обрезки
      setTrimSettings({ startTime, endTime });

      // Если есть файл, обрезаем его
      if (audioFile) {
        // Уведомляем о начале обрезки
        onTrimProgress?.(0);

        trimAudioFile(audioFile, startTime, endTime)
          .then((trimmedFile) => {
            // Уведомляем о завершении обрезки
            onTrimProgress?.(100);

            // Обновляем состояние
            setAudioFile(trimmedFile);

            // Вызываем onFileChange
            if (onFileChange) {
              onFileChange(trimmedFile);
            }
          })
          .catch((error) => {
            console.error("❌ Ошибка при обрезке аудио:", error);
          });
      }
    },
    [audioFile, trimAudioFile, onFileChange, onTrimProgress]
  );

  const resetTrim = useCallback(() => {
    setTrimSettings(null);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
    // Восстанавливаем оригинальный файл
    if (originalFile) {
      setAudioFile(originalFile);
      onFileChange?.(originalFile);
    }
  }, [originalFile, onFileChange]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Если есть настройки обрезки, устанавливаем начальную позицию
        if (trimSettings) {
          audio.currentTime = trimSettings.startTime;
        }

        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setIsPlaying(false);
    }
  }, [isPlaying, audioUrl, trimSettings]);

  // Обработчики событий аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      // Если есть настройки обрезки, останавливаем воспроизведение в конце фрагмента
      if (trimSettings && audio.currentTime >= trimSettings.endTime) {
        audio.pause();
        audio.currentTime = trimSettings.startTime;
        setIsPlaying(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [trimSettings]);

  if (audioUrl) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-primary" />
              ) : (
                <Play className="h-5 w-5 text-primary" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium">
                Аудио файл{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  {isPlaying
                    ? "Воспроизводится..."
                    : "(Готов к воспроизведению)"}
                </span>
              </p>
              {trimSettings && (
                <div className="text-xs text-primary">
                  (обрезано: {trimSettings.startTime.toFixed(1)}с -{" "}
                  {trimSettings.endTime.toFixed(1)}с)
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isEditing}
              onOpenChange={(open) => {
                setIsEditing(open);
                if (open) {
                  stopPlayback();
                  onEditorOpen?.();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <AudioEditor
                  audioUrl={audioUrl}
                  onSave={handleEdit}
                  onClose={() => setIsEditing(false)}
                  initialStartTime={trimSettings?.startTime}
                  initialEndTime={trimSettings?.endTime}
                />
              </DialogContent>
            </Dialog>
            {trimSettings && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetTrim}
                title="Сбросить обрезку"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Скрытый аудио элемент для воспроизведения */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{placeholder}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Поддерживаются форматы: MP3, WAV, OGG
        </p>
        {isDragOver && (
          <p className="text-sm text-primary mt-2 font-medium">
            Отпустите файл для загрузки
          </p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
