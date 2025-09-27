import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "./dialog";

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageViewer({
  open,
  onClose,
  imageUrl,
  alt = "Изображение",
}: ImageViewerProps) {
  const [showOriginalSize, setShowOriginalSize] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Закрываем модалку по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Блокируем скролл body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="z-[9998]" />
      <DialogContent className="image-viewer-dialog-content p-0 gradient-bg-animated border-none overflow-auto z-[9999] data-[state=open]:z-[9999]">
        <div className="relative min-w-full min-h-full flex items-center justify-center p-4">
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-[10000] bg-gray-800/80 hover:bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Кнопка переключения размера */}
          <button
            onClick={() => setShowOriginalSize(!showOriginalSize)}
            className="fixed top-4 right-16 z-[10000] bg-gray-800/80 hover:bg-gray-900 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            title={
              showOriginalSize ? "Подогнать под экран" : "Оригинальный размер"
            }
          >
            {showOriginalSize ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>

          {/* Изображение */}
          <img
            src={imageUrl}
            alt={alt}
            className={`object-contain transition-all duration-200 ${
              showOriginalSize
                ? "max-w-none max-h-none"
                : "max-w-full max-h-full"
            }`}
            style={
              showOriginalSize
                ? {
                    maxWidth: "none",
                    maxHeight: "none",
                    width: "auto",
                    height: "auto",
                  }
                : {
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                  }
            }
            onLoad={() => setImageLoaded(true)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Индикатор загрузки */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
