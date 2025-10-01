import { Database } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImagePicker } from "./image_picker";

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
}: DbFilePickerProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Синхронизируем внутреннее состояние с внешним значением
  useEffect(() => {
    if (value === null || value === "") {
      setSelectedImageUrl(null);
    } else if (typeof value === "string" && value.startsWith("http")) {
      setSelectedImageUrl(value);
    }
  }, [value]);

  const handleImageSelect = useCallback(
    (imageUrl: string) => {
      setShowImagePicker(false);
      setSelectedImageUrl(imageUrl);
      onChange?.(imageUrl);
    },
    [onChange]
  );

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
    </div>
  );
}
