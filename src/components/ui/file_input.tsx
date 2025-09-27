import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../shared/utils";
import { ImagePicker } from "./image_picker";

interface FileInputProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (event: any) => void; // Единственный колбек для react-hook-form
  value?: string | FileList | null; // Текущее значение из формы
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showFileNames?: boolean;
  maxFiles?: number;
  existingImageUrl?: string; // URL существующего изображения
  bucket?: string; // Бакет для выбора существующих изображений
  folder?: string; // Папка в бакете
}

export function FileInput({
  accept,
  multiple = false,
  onChange,
  value,
  className,
  placeholder = "Перетащите файл или загрузите",
  disabled = false,
  showFileNames = true,
  maxFiles,
  existingImageUrl,
  bucket,
  folder,
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Синхронизируем внутреннее состояние с внешним значением (только если value передан)
  useEffect(() => {
    if (value === undefined) return; // Если value не передан, не синхронизируем

    if (value === null) {
      // Значение сброшено - очищаем все
      setSelectedFiles([]);
      setSelectedImageUrl(null);
      setIsDeleted(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (typeof value === "string" && value.startsWith("http")) {
      // Это URL из БД
      setSelectedImageUrl(value);
      setSelectedFiles([]);
      setIsDeleted(false);
    } else if (value instanceof FileList && value.length > 0) {
      // Это FileList с файлами
      const files = Array.from(value);
      setSelectedFiles(files);
      setSelectedImageUrl(null);
      setIsDeleted(false);
    }
  }, [value]);

  // Определяем текущее изображение для отображения
  const currentImageUrl = (() => {
    if (
      selectedFiles.length > 0 &&
      selectedFiles[0].type.startsWith("image/")
    ) {
      return objectUrl;
    }
    if (selectedImageUrl && selectedFiles.length === 0 && !isDeleted) {
      return selectedImageUrl;
    }
    if (existingImageUrl && selectedFiles.length === 0 && !isDeleted) {
      return existingImageUrl;
    }
    return null;
  })();

  // Создаем object URL для изображений
  useEffect(() => {
    if (
      selectedFiles.length > 0 &&
      selectedFiles[0].type.startsWith("image/")
    ) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const newUrl = URL.createObjectURL(selectedFiles[0]);
      setObjectUrl(newUrl);
    } else {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
    }
  }, [selectedFiles, objectUrl]);

  // Очищаем object URL при размонтировании
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Простая функция для уведомления формы
  const notifyForm = useCallback(
    (value: FileList | string | null) => {
      onChange?.({
        target: { value, name: "bgFile" },
        type: "change",
      });
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        setIsDeleted(false);
        setSelectedImageUrl(null);
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

        // Уведомляем форму о новых файлах
        notifyForm(files);
      }
    },
    [multiple, maxFiles, notifyForm]
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
    setSelectedImageUrl(null); // Очищаем выбранное изображение из ImagePicker
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setSelectedImageUrl(null); // Очищаем выбранное изображение из ImagePicker
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImageSelect = useCallback(
    (imageUrl: string) => {
      setShowImagePicker(false);
      setIsDeleted(false);
      setSelectedImageUrl(imageUrl);
      setSelectedFiles([]);

      // Уведомляем форму о выборе изображения
      notifyForm(imageUrl);
    },
    [notifyForm]
  );

  return (
    <div className="space-y-6">
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

      {/* Универсальный блок для отображения изображений */}
      {currentImageUrl && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            {existingImageUrl && selectedFiles.length === 0 && !isDeleted
              ? "Текущее изображение"
              : selectedImageUrl && selectedFiles.length === 0 && !isDeleted
              ? "Выбранное изображение"
              : "Загруженное изображение"}
          </h4>
          <div className="relative inline-block">
            <img
              src={currentImageUrl}
              alt={
                existingImageUrl && selectedFiles.length === 0 && !isDeleted
                  ? "Текущее изображение"
                  : selectedImageUrl && selectedFiles.length === 0 && !isDeleted
                  ? "Выбранное изображение"
                  : "Загруженное изображение"
              }
              className="w-48 h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => {
                // Очищаем все и уведомляем форму
                setSelectedFiles([]);
                setSelectedImageUrl(null);
                setIsDeleted(true);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                notifyForm(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Разделитель и кнопка выбора из БД */}
      {bucket && !showImagePicker && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              Выбрать из галереи
            </button>
          </div>
        </div>
      )}

      {/* ImagePicker */}
      {bucket && (
        <ImagePicker
          bucket={bucket}
          folder={folder}
          onSelect={handleImageSelect}
          onClose={() => {
            setShowImagePicker(false);
            // Не сбрасываем selectedImageUrl при закрытии, только при выборе нового
          }}
          open={showImagePicker}
          defaultActive={
            selectedImageUrl && selectedFiles.length === 0
              ? selectedImageUrl
              : undefined
          }
        />
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
    </div>
  );
}
