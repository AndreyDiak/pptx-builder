import { Database, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImagePicker } from "./image_picker";
import { ImageViewer } from "./image_viewer";

interface DbFilePickerProps {
  onChange?: (imageUrl: string | null) => void;
  value?: string | null;
  className?: string;
  bucket: string;
  folder: string;
  placeholder?: string;
  disabled?: boolean;
  existingImageUrl?: string;
}

export function DbFilePicker({
  onChange,
  value,
  className,
  bucket,
  folder,
  placeholder = "Выберите изображение из галереи",
  disabled = false,
  existingImageUrl,
}: DbFilePickerProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Синхронизируем внутреннее состояние с внешним значением
  useEffect(() => {
    if (value === null || value === "") {
      setSelectedImageUrl(null);
      setIsDeleted(value === ""); // Если пустая строка, значит было удаление
    } else if (typeof value === "string" && value.startsWith("http")) {
      setSelectedImageUrl(value);
      setIsDeleted(false);
    }
  }, [value]);

  // Определяем текущее изображение для отображения
  const currentImageUrl = (() => {
    if (selectedImageUrl && !isDeleted) {
      return selectedImageUrl;
    }
    if (existingImageUrl && !selectedImageUrl && !isDeleted) {
      return existingImageUrl;
    }
    return null;
  })();

  const handleImageSelect = useCallback(
    (imageUrl: string) => {
      setShowImagePicker(false);
      setIsDeleted(false);
      setSelectedImageUrl(imageUrl);
      onChange?.(imageUrl);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    console.log(
      "DbFilePicker: Clearing image, setting empty string to mark form as dirty"
    );
    setSelectedImageUrl(null);
    setIsDeleted(true);
    // Передаем пустую строку вместо null, чтобы форма помечалась как dirty
    onChange?.("");
  }, [onChange]);

  const getImageTitle = () => {
    if (existingImageUrl && !selectedImageUrl && !isDeleted) {
      return "Текущее изображение";
    }
    if (selectedImageUrl && !isDeleted) {
      return "Выбранное изображение";
    }
    return "Изображение не выбрано";
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Кнопка выбора всегда сверху */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowImagePicker(true)}
            disabled={disabled}
            className={`
              w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 
              bg-white border border-[var(--input)] rounded-lg 
              hover:border-[var(--accent)] hover:bg-blue-50/50
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              transition-colors cursor-pointer
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <Database color="var(--primary)" />
            {placeholder}
          </button>
        </div>

        {/* Отображение выбранного изображения */}
        {currentImageUrl ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {getImageTitle()}
            </h4>
            <div className="relative inline-block">
              <img
                src={currentImageUrl}
                alt={getImageTitle()}
                className="w-48 h-24 object-cover rounded-lg border"
              />
              {/* Кнопка удаления */}
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className={`
                  absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 
                  flex items-center justify-center text-sm hover:bg-red-600 cursor-pointer
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                ✕
              </button>
              {/* Кнопка просмотра */}
              <button
                type="button"
                onClick={() => setShowImageViewer(true)}
                disabled={disabled}
                className={`
                  absolute bottom-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 
                  flex items-center justify-center text-sm hover:bg-blue-600 cursor-pointer
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Eye color="white" size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Placeholder когда нет изображения */
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Изображение не выбрано</p>
          </div>
        )}
      </div>

      {/* ImagePicker */}
      <ImagePicker
        bucket={bucket}
        folder={folder}
        onSelect={handleImageSelect}
        onClose={() => setShowImagePicker(false)}
        open={showImagePicker}
        defaultActive={selectedImageUrl || undefined}
      />

      {/* ImageViewer */}
      {currentImageUrl && (
        <ImageViewer
          open={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          imageUrl={currentImageUrl}
          alt={getImageTitle()}
        />
      )}
    </div>
  );
}
