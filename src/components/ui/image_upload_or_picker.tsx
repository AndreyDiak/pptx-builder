import * as ImageCompression from "@/shared/imageCompression";
import { cn } from "@/shared/utils";
import { Eye, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ImageUploadOrPickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
  placeholder?: string;
  compressionOptions?: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

export const ImageUploadOrPicker = ({
  value,
  onChange,
  onFileChange,
  className,
  placeholder = "Выберите изображение...",
  compressionOptions = {
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
  },
}: ImageUploadOrPickerProps) => {
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        const result = await ImageCompression.autoCompressImage(
          file,
          compressionOptions
        );

        const url = URL.createObjectURL(result.file);
        onChange?.(url);
        onFileChange?.(result.file);
      } catch (error) {
        console.error("Ошибка сжатия изображения:", error);
        alert("Ошибка при сжатии изображения");
      }
    },
    [compressionOptions, onChange, onFileChange]
  );


  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
        <p className="text-xs text-gray-500 mb-4">
          Поддерживаются: PNG, JPG, WebP, AVIF
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
          className="hidden"
          id="image-upload-input"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            document.getElementById("image-upload-input")?.click()
          }
        >
          Выбрать файл
        </Button>
      </div>

      {/* Показываем текущее изображение, если оно есть */}
      {value && (
        <div className="mt-4 space-y-3">
          <div className="relative">
            <img
              src={value}
              alt="Предварительный просмотр"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1"
              onClick={() => {
                onChange?.(null);
                onFileChange?.(null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-1 right-1"
              onClick={() => setShowImageViewer(true)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно для просмотра изображения */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Просмотр изображения</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            {value && (
              <img
                src={value}
                alt="Полный размер изображения"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
