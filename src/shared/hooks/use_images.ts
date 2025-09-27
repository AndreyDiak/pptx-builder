import { useCallback, useState } from 'react';
import { getFileList, getPublicUrl } from '../../actions/file';

interface UseImagesOptions {
  bucket: string;
  folder?: string;
}

export function useImages({ bucket, folder = '' }: UseImagesOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getImageList = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await getFileList({
        bucket,
        folder,
        limit: 100,
        offset: 0,
      });

      if (error) {
        setError('Не удалось загрузить изображения');
        return [];
      }

      if (!data) {
        return [];
      }

      // Фильтруем только изображения
      const imageFiles = data.filter((file: any) =>
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );

      // Получаем публичные URL для каждого изображения
      const imageUrls = imageFiles.map((file: any) => {
        return getPublicUrl(
          folder ? `${folder}/${file.name}` : file.name,
          bucket
        );
      });

      return imageUrls;
    } catch (err) {
      setError('Ошибка при загрузке изображений');
      return [];
    } finally {
      setLoading(false);
    }
  }, [bucket, folder]);

  return {
    getImageList,
    loading,
    error,
  };
}
