import * as ImageCompression from "@/shared/imageCompression";
import { cn } from "@/shared/utils";
import { Eye, Image as ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../base/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../base/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog/dialog";
import { SimpleImagePicker } from "./simple_image_picker";

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
  bucket?: string;
  folder?: string;
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
  bucket = "photos",
  folder = "tracks",
}: ImageUploadOrPickerProps) => {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

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

  const handleGalleryChange = useCallback(
    (url: string | null) => {
      onChange?.(url);
      // Для галереи не передаем файл, так как это уже существующее изображение
      onFileChange?.(null);
    },
    [onChange, onFileChange]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upload" | "gallery")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Загрузить новое
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Из галереи
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
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
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Выберите изображение из галереи
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Выберите из уже загруженных изображений
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImagePicker(true)}
            >
              Открыть галерею
            </Button>
          </div>
        </TabsContent>
      </Tabs>

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

      {/* SimpleImagePicker */}
      <SimpleImagePicker
        bucket={bucket}
        folder={folder}
        onSelect={(url) => {
          handleGalleryChange(url);
          setShowImagePicker(false);
        }}
        onClose={() => setShowImagePicker(false)}
        open={showImagePicker}
        defaultActive={value || undefined}
      />

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
