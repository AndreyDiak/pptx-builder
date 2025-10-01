import * as ImageCompression from "@/shared/imageCompression";
import { cn } from "@/shared/utils";
import { FileImage, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./button";

interface ImageUploadWithCompressionProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
  placeholder?: string;
  maxSize?: number; // максимальный размер в MB
  compressionOptions?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  showPreview?: boolean; // показывать ли предварительный просмотр
}

export const ImageUploadWithCompression = ({
  value,
  onChange,
  onFileChange,
  className,
  placeholder = "Выберите изображение...",
  maxSize = 5, // 5MB по умолчанию
  compressionOptions = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  },
  showPreview = true,
}: ImageUploadWithCompressionProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionResult, setCompressionResult] =
    useState<ImageCompression.CompressionResult | null>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, выберите изображение");
        return;
      }

      // Проверяем размер файла
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Размер файла не должен превышать ${maxSize}MB`);
        return;
      }

      setIsCompressing(true);
      setCompressionProgress(0);

      try {
        // Сжимаем изображение
        const result = await ImageCompression.compressImageWithProgress(
          file,
          compressionOptions,
          setCompressionProgress
        );

        setCompressionResult(result);

        // Создаем URL для предварительного просмотра
        const url = URL.createObjectURL(result.file);
        onChange?.(url);
        onFileChange?.(result.file);

        console.log("Изображение сжато:", {
          original: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
          compressed: `${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`,
          ratio: `${result.compressionRatio.toFixed(1)}%`,
          format: result.format,
        });
      } catch (error) {
        console.error("Ошибка сжатия изображения:", error);
        alert("Ошибка при сжатии изображения");
      } finally {
        setIsCompressing(false);
        setCompressionProgress(0);
      }
    },
    [maxSize, compressionOptions, onChange, onFileChange]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
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
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    if (value) {
      URL.revokeObjectURL(value);
    }
    setCompressionResult(null);
    onChange?.(null);
    onFileChange?.(null);
  }, [value, onChange, onFileChange]);

  if (value && showPreview) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative">
          <img
            src={value}
            alt="Предварительный просмотр"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {compressionResult && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <FileImage className="h-3 w-3" />
              <span className="font-medium">Сжатие завершено</span>
            </div>
            <div className="space-y-1">
              <div>
                Исходный размер:{" "}
                {(compressionResult.originalSize / 1024 / 1024).toFixed(2)}MB
              </div>
              <div>
                Сжатый размер:{" "}
                {(compressionResult.compressedSize / 1024 / 1024).toFixed(2)}MB
              </div>
              <div>
                Экономия: {compressionResult.compressionRatio.toFixed(1)}%
              </div>
              <div>Формат: {compressionResult.format.toUpperCase()}</div>
            </div>
          </div>
        )}
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
        onClick={() => document.getElementById("image-upload-input")?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isCompressing ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">
              Сжатие изображения...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${compressionProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {compressionProgress.toFixed(0)}%
            </p>
          </div>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Поддерживаются: PNG, JPG, WebP, AVIF
            </p>
            <p className="text-xs text-muted-foreground">
              Максимальный размер: {maxSize}MB
            </p>
            {isDragOver && (
              <p className="text-sm text-primary mt-2 font-medium">
                Отпустите файл для загрузки
              </p>
            )}
          </>
        )}
      </div>

      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};
