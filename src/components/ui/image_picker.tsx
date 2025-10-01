import { useEffect, useState } from "react";
import { useImages } from "../../shared/hooks/use_images";
import { cn } from "../../shared/utils";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ImagePickerProps {
  bucket: string;
  folder?: string;
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
  open: boolean;
  defaultActive?: string; // URL изображения, которое должно быть выбрано по умолчанию
}

export function ImagePicker({
  bucket,
  folder = "",
  onSelect,
  onClose,
  open,
  defaultActive,
}: ImagePickerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { getImageList, loading, error } = useImages({ bucket, folder });

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open, getImageList, defaultActive]);

  const loadImages = async () => {
    const imageList = await getImageList();
    setImages(imageList);

    // Если есть defaultActive и он есть в списке изображений, выбираем его
    if (defaultActive && imageList.includes(defaultActive)) {
      setSelectedImage(defaultActive);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      setSelectedImage(null);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Выберите изображение</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Загрузка изображений...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button onClick={loadImages} variant="outline">
                  Попробовать снова
                </Button>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 text-sm">Нет доступных изображений</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 h-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`Изображение ${index + 1}`}
                    className={cn(
                      "w-full h-24 object-cover rounded-lg border-2 transition-all",
                      selectedImage === imageUrl
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    )}
                  />

                  {/* Чекбокс в левом верхнем углу */}
                  <div className="absolute top-1 left-1">
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        selectedImage === imageUrl
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300 group-hover:border-blue-400"
                      )}
                    >
                      {selectedImage === imageUrl && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-auto flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedImage}>
            Выбрать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
