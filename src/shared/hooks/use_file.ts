import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { deleteFile, getPublicUrl, uploadFile, uploadMultipleFiles } from '../../actions/file';

interface UseFileOptions {
  bucket: string;
  folder?: string;
  usePath?: boolean;
}

export function useFile({ bucket, folder = '', usePath = false }: UseFileOptions) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFileCallback = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Создаем безопасное имя файла
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${safeFileName}` : safeFileName;

      const { data, error } = await uploadFile(file, filePath, bucket);
      
      if (error) {
        console.error('Ошибка загрузки файла:', error);
        toast.error('Не удалось загрузить файл');
        return null;
      }

      if (usePath) {
        setUploadProgress(100);
        return data.path;
      }

      // Получаем публичную ссылку
      const publicUrl = getPublicUrl(filePath, bucket);
      setUploadProgress(100);
      return publicUrl;

    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      toast.error('Не удалось загрузить файл');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [bucket, folder, usePath]);

  const uploadMultipleFilesCallback = useCallback(async (files: File[]): Promise<string[]> => {
    try {
      setUploading(true);
      
      // Создаем безопасные имена файлов
      const filePaths = files.map(file => {
        const fileExt = file.name.split('.').pop();
        const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        return folder ? `${folder}/${safeFileName}` : safeFileName;
      });

      const results = await uploadMultipleFiles(files, filePaths, bucket);
      
      // Обрабатываем результаты
      const urls: string[] = [];
      for (let i = 0; i < results.length; i++) {
        const { data, error } = results[i];
        if (error) {
          console.error('Ошибка загрузки файла:', error);
          continue;
        }
        
        if (usePath) {
          urls.push(data.path);
        } else {
          urls.push(getPublicUrl(filePaths[i], bucket));
        }
      }
      
      if (urls.length === 0) {
        toast.error('Не удалось загрузить файлы');
      } else if (urls.length < files.length) {
        toast.error(`Загружено ${urls.length} из ${files.length} файлов`);
      }
      
      return urls;
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      toast.error('Не удалось загрузить файлы');
      return [];
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, usePath]);

  const deleteFileCallback = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await deleteFile(filePath, bucket);
      
      if (error) {
        console.error('Ошибка удаления файла:', error);
        toast.error('Не удалось удалить файл');
        return false;
      }

      toast.success('Файл удален');
      return true;
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      toast.error('Не удалось удалить файл');
      return false;
    }
  }, [bucket]);

  return {
    uploadFile: uploadFileCallback,
    uploadMultipleFiles: uploadMultipleFilesCallback,
    deleteFile: deleteFileCallback,
    uploading,
    uploadProgress
  };
}
