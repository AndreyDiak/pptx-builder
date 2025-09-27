import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../shared/utils";
import { ImageViewer } from "./image_viewer";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
  value?: FileList | null;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showFileNames?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  accept,
  multiple = false,
  onChange,
  value,
  className,
  placeholder = "Перетащите файл или загрузите",
  disabled = false,
  showFileNames = true,
  maxFiles,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Синхронизируем внутреннее состояние с внешним значением
  useEffect(() => {
    if (value === null) {
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (value instanceof FileList && value.length > 0) {
      const files = Array.from(value);
      setSelectedFiles(files);
    }
  }, [value]);

  // Создаем object URL для изображений
  useEffect(() => {
    if (
      selectedFiles.length > 0 &&
      selectedFiles[0].type.startsWith("image/")
    ) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const newUrl = URL.createObjectURL(selectedFiles[0]);
      objectUrlRef.current = newUrl;
      setObjectUrl(newUrl);
    } else {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
        setObjectUrl(null);
      }
    }
  }, [selectedFiles]);

  // Очищаем object URL при размонтировании
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);

        if (!multiple && maxFiles && fileArray.length > maxFiles) {
          return;
        }

        if (multiple) {
          setSelectedFiles((prev) => {
            const newFiles = [...prev, ...fileArray];
            return maxFiles && newFiles.length > maxFiles
              ? newFiles.slice(-maxFiles)
              : newFiles;
          });
        } else {
          setSelectedFiles(fileArray);
        }

        onChange?.(files);
      }
    },
    [multiple, maxFiles, onChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled, handleFileSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.(null);
  }, [onChange]);

  // Определяем текущее изображение для отображения
  const currentImageUrl = (() => {
    if (
      selectedFiles.length > 0 &&
      selectedFiles[0].type.startsWith("image/")
    ) {
      return objectUrl;
    }
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50",
            isDragOver && "border-blue-500 bg-blue-50 scale-[1.02]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="space-y-2">
            <div className="text-gray-600">
              {placeholder.split(" ").map((word, index, array) => {
                if (index === array.length - 1) {
                  return (
                    <span
                      key={index}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {word}
                    </span>
                  );
                }
                return <span key={index}>{word} </span>;
              })}
            </div>
            {maxFiles && selectedFiles.length >= maxFiles && (
              <div className="text-sm text-gray-500">
                Можно заменить файл (максимум: {maxFiles})
              </div>
            )}
            {maxFiles &&
              selectedFiles.length > 0 &&
              selectedFiles.length < maxFiles && (
                <div className="text-sm text-gray-500">
                  Можно добавить еще {maxFiles - selectedFiles.length} файл(ов)
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Отображение изображения */}
      {currentImageUrl && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Загруженное изображение
          </h4>
          <div className="relative inline-block">
            <img
              src={currentImageUrl}
              alt="Загруженное изображение"
              className="w-48 h-24 object-cover rounded-lg border"
            />
            {/* Кнопка удаления */}
            <button
              type="button"
              onClick={clearAllFiles}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ✕
            </button>
            {/* Кнопка просмотра */}
            <button
              type="button"
              onClick={() => setShowImageViewer(true)}
              className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-blue-600"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Отображение выбранных файлов (только не-изображения) */}
      {showFileNames &&
        selectedFiles.length > 0 &&
        !selectedFiles[0].type.startsWith("image/") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                Выбранные файлы ({selectedFiles.length})
              </h4>
              {selectedFiles.length > 1 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Очистить все
                </button>
              )}
            </div>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* ImageViewer */}
      {currentImageUrl && (
        <ImageViewer
          open={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          imageUrl={currentImageUrl}
          alt="Загруженное изображение"
        />
      )}
    </div>
  );
}
