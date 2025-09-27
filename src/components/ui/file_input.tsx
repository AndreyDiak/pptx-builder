import { useCallback, useState } from "react";
import { DbFilePicker } from "./db_file_picker";
import { FileUpload } from "./file_upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface FileInputProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (event: any) => void; // Единственный колбек для react-hook-form
  value?: string | FileList | null; // Текущее значение из формы
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showFileNames?: boolean;
  maxFiles?: number;
  existingImageUrl?: string; // URL существующего изображения
  bucket?: string; // Бакет для выбора существующих изображений
  folder?: string; // Папка в бакете
  defaultTab?: "upload" | "gallery"; // Таб по умолчанию
  name?: string; // Имя поля для формы
}

export function FileInput({
  accept,
  multiple = false,
  onChange,
  value,
  className,
  placeholder = "Перетащите файл или загрузите",
  disabled = false,
  showFileNames = true,
  maxFiles,
  existingImageUrl,
  bucket,
  folder,
  defaultTab = "upload",
  name = "file",
}: FileInputProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">(defaultTab);

  // Простая функция для уведомления формы
  const notifyForm = useCallback(
    (value: FileList | string | null) => {
      console.log("FileInput: Notifying form with:", {
        value,
        name,
        type: typeof value,
      });
      onChange?.({
        target: { value, name },
        type: "change",
      });
    },
    [onChange, name]
  );

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      notifyForm(files);
    },
    [notifyForm]
  );

  const handleDbFileSelect = useCallback(
    (imageUrl: string | null) => {
      notifyForm(imageUrl);
    },
    [notifyForm]
  );

  // Если нет bucket, показываем только загрузку файлов
  if (!bucket) {
    return (
      <FileUpload
        accept={accept}
        multiple={multiple}
        onChange={handleFileUpload}
        value={value instanceof FileList ? value : null}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        showFileNames={showFileNames}
        maxFiles={maxFiles}
      />
    );
  }

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upload" | "gallery")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Загрузить файл</TabsTrigger>
          <TabsTrigger value="gallery">Выбрать из галереи</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <FileUpload
            accept={accept}
            multiple={multiple}
            onChange={handleFileUpload}
            value={value instanceof FileList ? value : null}
            placeholder={placeholder}
            disabled={disabled}
            showFileNames={showFileNames}
            maxFiles={maxFiles}
          />
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <DbFilePicker
            onChange={handleDbFileSelect}
            value={typeof value === "string" ? value : null}
            bucket={bucket}
            folder={folder || ""}
            placeholder="Выберите изображение из галереи"
            disabled={disabled}
            existingImageUrl={existingImageUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
