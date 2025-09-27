import React, { useCallback, useState } from 'react';
import { StorageService } from '../services/storageService';

interface FileUploadProps {
  projectId: string;
  slideId?: string;
  onUpload?: (result: { path: string; url: string }) => void;
  accept?: string;
  maxSize?: number; // в байтах
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  projectId,
  slideId,
  onUpload,
  accept = "audio/*,image/*",
  maxSize = 50 * 1024 * 1024, // 50MB по умолчанию
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    if (accept && !accept.split(',').some(type => {
      const cleanType = type.trim();
      if (cleanType.endsWith('/*')) {
        return file.type.startsWith(cleanType.slice(0, -1));
      }
      return file.type === cleanType;
    })) {
      return `Неподдерживаемый тип файла. Разрешены: ${accept}`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Валидация файла
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Симуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      let result;
      if (file.type.startsWith('audio/')) {
        result = await StorageService.uploadAudioForProject(projectId, file, slideId);
      } else if (file.type.startsWith('image/')) {
        if (!slideId) {
          setError('Для загрузки изображения требуется slideId');
          return;
        }
        result = await StorageService.uploadImageForSlide(projectId, slideId, file);
      } else {
        setError('Неподдерживаемый тип файла');
        return;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result) {
        onUpload?.(result);
        // Сброс формы
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError('Ошибка при загрузке файла');
      }
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      setError('Ошибка при загрузке файла');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [projectId, slideId, onUpload, accept, maxSize]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>Загрузка... {Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              {dragActive ? 'Отпустите файл здесь' : 'Перетащите файл или нажмите для выбора'}
            </p>
            <p className="upload-hint">
              Максимальный размер: {formatFileSize(maxSize)}
            </p>
            <p className="upload-hint">
              Поддерживаемые форматы: {accept}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      <style jsx>{`
        .file-upload {
          width: 100%;
          max-width: 400px;
        }

        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .upload-area:hover {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .upload-area.drag-active {
          border-color: #007bff;
          background: #e6f3ff;
          transform: scale(1.02);
        }

        .upload-area.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .upload-text {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          margin: 0;
        }

        .upload-hint {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          transition: width 0.3s ease;
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #ffe6e6;
          border: 1px solid #ffcccc;
          border-radius: 4px;
          color: #d63384;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .error-text {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
