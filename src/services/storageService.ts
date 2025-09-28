import { supabase } from '../../supabase/client';

/**
 * Типы для работы с файлами
 */
export interface FileUpload {
  file: File;
  path: string;
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  };
}

export interface FileInfo {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export interface StorageBucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
  avif_autodetection: boolean;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  owner_id: string;
}

/**
 * Сервис для работы с Supabase Storage
 */
export class StorageService {
  
  /**
   * Создать бакет для хранения файлов
   */
  static async createBucket(
    bucketName: string, 
    isPublic: boolean = true,
    options?: {
      fileSizeLimit?: number;
      allowedMimeTypes?: string[];
    }
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: options?.fileSizeLimit,
        allowedMimeTypes: options?.allowedMimeTypes
      });

      if (error) {
        console.error('Ошибка при создании бакета:', error);
        return false;
      }

      console.log('✅ Бакет создан:', bucketName);
      return true;
    } catch (error) {
      console.error('Ошибка в createBucket:', error);
      return false;
    }
  }

  /**
   * Получить список бакетов
   */
  static async getBuckets(): Promise<StorageBucket[]> {
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        console.error('Ошибка при получении бакетов:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Ошибка в getBuckets:', error);
      return [];
    }
  }

  /**
   * Загрузить файл в бакет
   */
  static async uploadFile(
    bucketName: string,
    fileUpload: FileUpload
  ): Promise<{ path: string; fullPath: string } | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileUpload.path, fileUpload.file, fileUpload.options);

      if (error) {
        console.error('Ошибка при загрузке файла:', error);
        return null;
      }

      return {
        path: data.path,
        fullPath: data.fullPath
      };
    } catch (error) {
      console.error('Ошибка в uploadFile:', error);
      return null;
    }
  }

  /**
   * Загрузить несколько файлов
   */
  static async uploadMultipleFiles(
    bucketName: string,
    files: FileUpload[]
  ): Promise<Array<{ path: string; fullPath: string } | null>> {
    try {
      const uploadPromises = files.map(fileUpload => 
        this.uploadFile(bucketName, fileUpload)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Ошибка в uploadMultipleFiles:', error);
      return [];
    }
  }

  /**
   * Получить публичный URL файла
   */
  static getPublicUrl(bucketName: string, path: string): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Получить подписанный URL для приватного файла
   */
  static async getSignedUrl(
    bucketName: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Ошибка при создании подписанного URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Ошибка в getSignedUrl:', error);
      return null;
    }
  }

  /**
   * Скачать файл
   */
  static async downloadFile(
    bucketName: string,
    path: string
  ): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path);

      if (error) {
        console.error('Ошибка при скачивании файла:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Ошибка в downloadFile:', error);
      return null;
    }
  }

  /**
   * Получить список файлов в бакете
   */
  static async listFiles(
    bucketName: string,
    path: string = '',
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    }
  ): Promise<FileInfo[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path, options);

      if (error) {
        console.error('Ошибка при получении списка файлов:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Ошибка в listFiles:', error);
      return [];
    }
  }

  /**
   * Удалить файл
   */
  static async deleteFile(
    bucketName: string,
    paths: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove(paths);

      if (error) {
        console.error('Ошибка при удалении файла:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка в deleteFile:', error);
      return false;
    }
  }

  /**
   * Переместить файл
   */
  static async moveFile(
    bucketName: string,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .move(fromPath, toPath);

      if (error) {
        console.error('Ошибка при перемещении файла:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка в moveFile:', error);
      return false;
    }
  }

  /**
   * Копировать файл
   */
  static async copyFile(
    bucketName: string,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .copy(fromPath, toPath);

      if (error) {
        console.error('Ошибка при копировании файла:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ошибка в copyFile:', error);
      return false;
    }
  }

  /**
   * Получить информацию о файле
   */
  static async getFileInfo(
    bucketName: string,
    path: string
  ): Promise<FileInfo | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error) {
        console.error('Ошибка при получении информации о файле:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Ошибка в getFileInfo:', error);
      return null;
    }
  }

  /**
   * Загрузить аудиофайл для проекта
   */
  static async uploadAudioForProject(
    projectId: string,
    file: File,
    slideId?: string
  ): Promise<{ path: string; url: string } | null> {
    try {
      // Создаем путь для аудиофайла
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = slideId 
        ? `audio/${projectId}/${slideId}/${timestamp}.${fileExtension}`
        : `audio/${projectId}/${timestamp}.${fileExtension}`;

      const uploadResult = await this.uploadFile('audio-files', {
        file,
        path: fileName,
        options: {
          cacheControl: '3600',
          upsert: false
        }
      });

      if (!uploadResult) {
        return null;
      }

      const publicUrl = this.getPublicUrl('audio-files', uploadResult.path);

      return {
        path: uploadResult.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Ошибка в uploadAudioForProject:', error);
      return null;
    }
  }

  /**
   * Загрузить изображение для слайда
   */
  static async uploadImageForSlide(
    projectId: string,
    slideId: string,
    file: File
  ): Promise<{ path: string; url: string } | null> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `images/${projectId}/${slideId}/${timestamp}.${fileExtension}`;

      const uploadResult = await this.uploadFile('slide-images', {
        file,
        path: fileName,
        options: {
          cacheControl: '3600',
          upsert: false
        }
      });

      if (!uploadResult) {
        return null;
      }

      const publicUrl = this.getPublicUrl('slide-images', uploadResult.path);

      return {
        path: uploadResult.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Ошибка в uploadImageForSlide:', error);
      return null;
    }
  }

  /**
   * Получить все файлы проекта
   */
  static async getProjectFiles(projectId: string): Promise<{
    audio: FileInfo[];
    images: FileInfo[];
  }> {
    try {
      const [audioFiles, imageFiles] = await Promise.all([
        this.listFiles('audio-files', `audio/${projectId}`),
        this.listFiles('slide-images', `images/${projectId}`)
      ]);

      return {
        audio: audioFiles,
        images: imageFiles
      };
    } catch (error) {
      console.error('Ошибка в getProjectFiles:', error);
      return { audio: [], images: [] };
    }
  }

  /**
   * Удалить все файлы проекта
   */
  static async deleteProjectFiles(projectId: string): Promise<boolean> {
    try {
      const projectFiles = await this.getProjectFiles(projectId);
      
      const allPaths = [
        ...projectFiles.audio.map(file => file.name),
        ...projectFiles.images.map(file => file.name)
      ];

      if (allPaths.length === 0) {
        return true;
      }

      const [audioResult, imageResult] = await Promise.all([
        this.deleteFile('audio-files', projectFiles.audio.map(file => file.name)),
        this.deleteFile('slide-images', projectFiles.images.map(file => file.name))
      ]);

      return audioResult && imageResult;
    } catch (error) {
      console.error('Ошибка в deleteProjectFiles:', error);
      return false;
    }
  }

  /**
   * Загрузить аудиофайл для трека
   */
  static async uploadTrackAudio(
    file: File
  ): Promise<{ path: string; url: string } | null> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `tracks/${timestamp}.${fileExtension}`;

      const uploadResult = await this.uploadFile('audios', {
        file,
        path: fileName,
        options: {
          cacheControl: '3600',
          upsert: false
        }
      });

      if (!uploadResult) {
        return null;
      }

      const publicUrl = this.getPublicUrl('audios', uploadResult.path);

      return {
        path: uploadResult.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Ошибка в uploadTrackAudio:', error);
      return null;
    }
  }

  /**
   * Загрузить изображение для трека
   */
  static async uploadTrackImage(
    file: File
  ): Promise<{ path: string; url: string } | null> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `tracks/${timestamp}.${fileExtension}`;

      const uploadResult = await this.uploadFile('photos', {
        file,
        path: fileName,
        options: {
          cacheControl: '3600',
          upsert: false
        }
      });

      if (!uploadResult) {
        return null;
      }

      const publicUrl = this.getPublicUrl('photos', uploadResult.path);

      return {
        path: uploadResult.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Ошибка в uploadTrackImage:', error);
      return null;
    }
  }
}
