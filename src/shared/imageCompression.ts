/**
 * Утилиты для сжатия изображений
 */

export interface CompressionOptions {
  quality?: number; // 0-1, качество сжатия
  maxWidth?: number; // максимальная ширина
  maxHeight?: number; // максимальная высота
  format?: 'webp' | 'avif' | 'jpeg' | 'png'; // формат вывода
  preserveAlpha?: boolean; // сохранять прозрачность
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}

/**
 * Проверяет поддержку формата браузером
 */
export function isFormatSupported(format: string): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const mimeType = `image/${format}`;
  return canvas.toDataURL(mimeType).indexOf(mimeType) === 5;
}

/**
 * Сжимает изображение с сохранением прозрачности
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Не удалось создать canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Устанавливаем размеры canvas
        canvas.width = width;
        canvas.height = height;

        // Настройки рендеринга для лучшего качества
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);

        // Определяем MIME тип
        let mimeType: string;
        let fileExtension: string;

        switch (format) {
          case 'webp':
            mimeType = 'image/webp';
            fileExtension = 'webp';
            break;
          case 'avif':
            mimeType = 'image/avif';
            fileExtension = 'avif';
            break;
          case 'jpeg':
            mimeType = 'image/jpeg';
            fileExtension = 'jpg';
            break;
          case 'png':
            mimeType = 'image/png';
            fileExtension = 'png';
            break;
          default:
            mimeType = 'image/webp';
            fileExtension = 'webp';
        }

        // Проверяем поддержку формата
        if (!isFormatSupported(format)) {
          console.warn(`Формат ${format} не поддерживается, используем PNG`);
          mimeType = 'image/png';
          fileExtension = 'png';
        }

        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Не удалось создать сжатое изображение'));
              return;
            }

            // Создаем новый файл
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File(
              [blob],
              `${originalName}_compressed.${fileExtension}`,
              { type: mimeType }
            );

            const result: CompressionResult = {
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: (1 - blob.size / file.size) * 100,
              format: fileExtension
            };

            resolve(result);
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Не удалось загрузить изображение'));
    };

    // Загружаем изображение
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Автоматически выбирает лучший формат для сжатия
 */
export async function autoCompressImage(
  file: File,
  options: Omit<CompressionOptions, 'format'> = {}
): Promise<CompressionResult> {
  const formats = ['avif', 'webp', 'png'] as const;
  
  for (const format of formats) {
    if (isFormatSupported(format)) {
      try {
        const result = await compressImage(file, { ...options, format });
        console.log(`Успешно сжато в ${format}:`, {
          original: `${(result.originalSize / 1024 / 1024).toFixed(2)}MB`,
          compressed: `${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`,
          ratio: `${result.compressionRatio.toFixed(1)}%`
        });
        return result;
      } catch (error) {
        console.warn(`Ошибка сжатия в ${format}:`, error);
        continue;
      }
    }
  }

  // Fallback к PNG если ничего не работает
  return compressImage(file, { ...options, format: 'png' });
}

/**
 * Сжимает изображение с прогрессом
 */
export async function compressImageWithProgress(
  file: File,
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  onProgress?.(0);
  
  try {
    const result = await autoCompressImage(file, options);
    onProgress?.(100);
    return result;
  } catch (error) {
    onProgress?.(0);
    throw error;
  }
}
