import type { FileUpload } from '../services/storageService';
import { StorageService } from '../services/storageService';

/**
 * Примеры использования Supabase Storage
 */
export class StorageExample {
  
  /**
   * Пример создания бакетов для файлов
   */
  static async createBucketsExample() {
    console.log('🪣 Создание бакетов для файлов...');
    
    try {
      // Создаем бакет для аудиофайлов
      const audioBucket = await StorageService.createBucket('audio-files', true, {
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
      });

      // Создаем бакет для изображений
      const imageBucket = await StorageService.createBucket('slide-images', true, {
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      console.log('✅ Бакет для аудио:', audioBucket ? 'создан' : 'уже существует');
      console.log('✅ Бакет для изображений:', imageBucket ? 'создан' : 'уже существует');
      
      return { audioBucket, imageBucket };
    } catch (error) {
      console.error('❌ Ошибка при создании бакетов:', error);
      return null;
    }
  }

  /**
   * Пример получения списка бакетов
   */
  static async getBucketsExample() {
    console.log('📋 Получение списка бакетов...');
    
    const buckets = await StorageService.getBuckets();
    
    console.log('✅ Найденные бакеты:');
    buckets.forEach(bucket => {
      console.log(`  🪣 ${bucket.name} (публичный: ${bucket.public ? 'да' : 'нет'})`);
      console.log(`     Размер файла: ${bucket.file_size_limit ? `${bucket.file_size_limit / 1024 / 1024}MB` : 'без ограничений'}`);
      console.log(`     MIME типы: ${bucket.allowed_mime_types?.join(', ') || 'все'}`);
    });
    
    return buckets;
  }

  /**
   * Пример загрузки аудиофайла для проекта
   */
  static async uploadAudioExample(projectId: string, audioFile: File) {
    console.log('🎵 Загрузка аудиофайла...');
    
    const result = await StorageService.uploadAudioForProject(projectId, audioFile);
    
    if (result) {
      console.log('✅ Аудиофайл загружен:');
      console.log(`  📁 Путь: ${result.path}`);
      console.log(`  🔗 URL: ${result.url}`);
      console.log(`  📊 Размер: ${audioFile.size} байт`);
      console.log(`  🎵 Тип: ${audioFile.type}`);
      return result;
    } else {
      console.log('❌ Ошибка при загрузке аудиофайла');
      return null;
    }
  }

  /**
   * Пример загрузки изображения для слайда
   */
  static async uploadImageExample(projectId: string, slideId: string, imageFile: File) {
    console.log('🖼️ Загрузка изображения...');
    
    const result = await StorageService.uploadImageForSlide(projectId, slideId, imageFile);
    
    if (result) {
      console.log('✅ Изображение загружено:');
      console.log(`  📁 Путь: ${result.path}`);
      console.log(`  🔗 URL: ${result.url}`);
      console.log(`  📊 Размер: ${imageFile.size} байт`);
      console.log(`  🖼️ Тип: ${imageFile.type}`);
      return result;
    } else {
      console.log('❌ Ошибка при загрузке изображения');
      return null;
    }
  }

  /**
   * Пример загрузки нескольких файлов
   */
  static async uploadMultipleFilesExample(projectId: string, files: File[]) {
    console.log('📁 Загрузка нескольких файлов...');
    
    const fileUploads: FileUpload[] = files.map((file, index) => ({
      file,
      path: `uploads/${projectId}/${Date.now()}-${index}-${file.name}`,
      options: {
        cacheControl: '3600',
        upsert: false
      }
    }));

    const results = await StorageService.uploadMultipleFiles('audio-files', fileUploads);
    
    console.log('✅ Результаты загрузки:');
    results.forEach((result, index) => {
      if (result) {
        console.log(`  📄 ${files[index].name}: загружен (${result.path})`);
      } else {
        console.log(`  ❌ ${files[index].name}: ошибка загрузки`);
      }
    });
    
    return results;
  }

  /**
   * Пример получения списка файлов проекта
   */
  static async getProjectFilesExample(projectId: string) {
    console.log('📂 Получение файлов проекта...');
    
    const projectFiles = await StorageService.getProjectFiles(projectId);
    
    console.log('✅ Файлы проекта:');
    console.log(`  🎵 Аудиофайлы: ${projectFiles.audio.length}`);
    projectFiles.audio.forEach(file => {
      console.log(`    - ${file.name} (${file.metadata.size} байт)`);
    });
    
    console.log(`  🖼️ Изображения: ${projectFiles.images.length}`);
    projectFiles.images.forEach(file => {
      console.log(`    - ${file.name} (${file.metadata.size} байт)`);
    });
    
    return projectFiles;
  }

  /**
   * Пример получения публичного URL
   */
  static async getPublicUrlExample(bucketName: string, filePath: string) {
    console.log('🔗 Получение публичного URL...');
    
    const publicUrl = StorageService.getPublicUrl(bucketName, filePath);
    
    console.log('✅ Публичный URL:');
    console.log(`  🔗 ${publicUrl}`);
    
    return publicUrl;
  }

  /**
   * Пример получения подписанного URL
   */
  static async getSignedUrlExample(bucketName: string, filePath: string) {
    console.log('🔐 Получение подписанного URL...');
    
    const signedUrl = await StorageService.getSignedUrl(bucketName, filePath, 3600);
    
    if (signedUrl) {
      console.log('✅ Подписанный URL (действителен 1 час):');
      console.log(`  🔐 ${signedUrl}`);
      return signedUrl;
    } else {
      console.log('❌ Ошибка при получении подписанного URL');
      return null;
    }
  }

  /**
   * Пример скачивания файла
   */
  static async downloadFileExample(bucketName: string, filePath: string) {
    console.log('⬇️ Скачивание файла...');
    
    const blob = await StorageService.downloadFile(bucketName, filePath);
    
    if (blob) {
      console.log('✅ Файл скачан:');
      console.log(`  📊 Размер: ${blob.size} байт`);
      console.log(`  🎯 Тип: ${blob.type}`);
      
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob);
      console.log(`  🔗 URL для скачивания: ${url}`);
      
      return { blob, url };
    } else {
      console.log('❌ Ошибка при скачивании файла');
      return null;
    }
  }

  /**
   * Пример удаления файла
   */
  static async deleteFileExample(bucketName: string, filePaths: string[]) {
    console.log('🗑️ Удаление файлов...');
    
    const result = await StorageService.deleteFile(bucketName, filePaths);
    
    if (result) {
      console.log('✅ Файлы удалены:');
      filePaths.forEach(path => {
        console.log(`  🗑️ ${path}`);
      });
    } else {
      console.log('❌ Ошибка при удалении файлов');
    }
    
    return result;
  }

  /**
   * Пример перемещения файла
   */
  static async moveFileExample(bucketName: string, fromPath: string, toPath: string) {
    console.log('🔄 Перемещение файла...');
    
    const result = await StorageService.moveFile(bucketName, fromPath, toPath);
    
    if (result) {
      console.log('✅ Файл перемещен:');
      console.log(`  📁 Из: ${fromPath}`);
      console.log(`  📁 В: ${toPath}`);
    } else {
      console.log('❌ Ошибка при перемещении файла');
    }
    
    return result;
  }

  /**
   * Пример копирования файла
   */
  static async copyFileExample(bucketName: string, fromPath: string, toPath: string) {
    console.log('📋 Копирование файла...');
    
    const result = await StorageService.copyFile(bucketName, fromPath, toPath);
    
    if (result) {
      console.log('✅ Файл скопирован:');
      console.log(`  📁 Из: ${fromPath}`);
      console.log(`  📁 В: ${toPath}`);
    } else {
      console.log('❌ Ошибка при копировании файла');
    }
    
    return result;
  }

  /**
   * Полный пример работы с Storage
   */
  static async fullStorageExample() {
    console.log('🎯 Запуск полного примера работы с Storage...\n');
    
    try {
      // 1. Создаем бакеты
      await this.createBucketsExample();
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 2. Получаем список бакетов
      await this.getBucketsExample();
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 3. Создаем тестовые файлы
      const projectId = 'test-project-' + Date.now();
      const slideId = 'test-slide-' + Date.now();
      
      // Создаем тестовый аудиофайл (пустой)
      const audioBlob = new Blob(['test audio content'], { type: 'audio/mpeg' });
      const audioFile = new File([audioBlob], 'test-audio.mp3', { type: 'audio/mpeg' });
      
      // Создаем тестовое изображение (пустое)
      const imageBlob = new Blob(['test image content'], { type: 'image/jpeg' });
      const imageFile = new File([imageBlob], 'test-image.jpg', { type: 'image/jpeg' });
      
      // 4. Загружаем аудиофайл
      const audioResult = await this.uploadAudioExample(projectId, audioFile);
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 5. Загружаем изображение
      const imageResult = await this.uploadImageExample(projectId, slideId, imageFile);
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 6. Получаем файлы проекта
      await this.getProjectFilesExample(projectId);
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 7. Получаем публичные URL
      if (audioResult) {
        await this.getPublicUrlExample('audio-files', audioResult.path);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // 8. Получаем подписанный URL
      if (imageResult) {
        await this.getSignedUrlExample('slide-images', imageResult.path);
      }
      
      console.log('\n🎉 Полный пример работы с Storage завершен!');
      
    } catch (error) {
      console.error('❌ Ошибка в полном примере:', error);
    }
  }

  /**
   * Пример работы с файлами в React компоненте
   */
  static createFileUploadHandler(projectId: string, slideId?: string) {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      
      try {
        let result;
        if (file.type.startsWith('audio/')) {
          result = await StorageService.uploadAudioForProject(projectId, file, slideId);
        } else if (file.type.startsWith('image/')) {
          if (!slideId) {
            console.error('Для загрузки изображения требуется slideId');
            return;
          }
          result = await StorageService.uploadImageForSlide(projectId, slideId, file);
        } else {
          console.error('Неподдерживаемый тип файла');
          return;
        }

        if (result) {
          console.log('Файл загружен:', result.url);
          return result;
        }
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
      }
    };
  }
}

// Экспортируем для использования в других частях приложения
export default StorageExample;
