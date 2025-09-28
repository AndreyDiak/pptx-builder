import { AudioInput } from "@/components/ui/audio_input";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileInput } from "@/components/ui/file_input";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form_field";
import { FormSubmitButton } from "@/components/ui/form_submit_button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorageService } from "@/services/storageService";
import { useProject } from "@/shared/hooks/use_project";
import { useTrack } from "@/shared/hooks/use_track";
import { useTracks } from "@/shared/hooks/use_tracks";
import { Fragment, useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { TrackInsert } from "../types";

interface Props {
  projectId: number;
  defaultValues?: Partial<TrackInsert>;
  onSuccess?: () => void;
}

interface FormValues extends TrackInsert {}

const defaultValues: Partial<TrackInsert> = {
  name: "",
  author: "",
  audio_src: "",
  image_src: "",
  index: 0,
};

export const CreateTrackDialogForm = ({
  projectId,
  defaultValues: propsDefaultValues,
}: Props) => {
  const edit = !!propsDefaultValues?.id;
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioFileRef = useRef<File | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);

  const handleAudioFileChange = useCallback(
    (file: File | null) => {
      // Проверяем, что это действительно обрезанный файл
      if (file && file.name.includes("_trimmed")) {
        setIsTrimming(false); // Обрезка завершена
        setTrimProgress(0); // Сбрасываем прогресс
      }

      setAudioFile(file);
      audioFileRef.current = file; // Обновляем ref синхронно
    },
    [audioFile]
  );

  const handleEditorOpen = useCallback(() => {
    setIsTrimming(true);
    setTrimProgress(0);
  }, []);

  const handleTrimProgress = useCallback((progress: number) => {
    setTrimProgress(progress);
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  const { onCreate, onUpdate } = useTrack(
    edit ? propsDefaultValues.id! : 0,
    !edit
  );

  const { data: project } = useProject(projectId);
  const { data: tracks } = useTracks(projectId);

  const indexes = Array.from(
    { length: (project?.size_x ?? 0) * (project?.size_y ?? 0) },
    (_, index) => index + 1
  );

  const takenIndexes = new Set(tracks?.map((track) => track.index));

  const availableIndexes = indexes.filter((index) => !takenIndexes.has(index));

  const manager = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
      ...propsDefaultValues,
    },
  });

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      // Если идет обрезка, ждем ее завершения
      if (isTrimming) {
        // Ждем до 30 секунд
        let attempts = 0;
        while (isTrimming && attempts < 60) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }
      }

      setIsUploading(true);

      try {
        let audioSrc = data.audio_src;
        let imageSrc = data.image_src;

        // Загружаем аудио файл, если он есть (используем ref для актуального значения)
        const currentAudioFile = audioFileRef.current || audioFile;
        if (currentAudioFile) {
          const audioResult = await StorageService.uploadTrackAudio(
            projectId,
            currentAudioFile
          );
          if (!audioResult) {
            throw new Error("Не удалось загрузить аудио файл");
          }
          audioSrc = audioResult.url;
        }

        // Загружаем изображение, если оно есть и это новый файл
        if (data.image_src) {
          // Если это строка (URL), используем как есть
          if (
            typeof data.image_src === "string" &&
            data.image_src.trim() !== ""
          ) {
            imageSrc = data.image_src;
          }
          // Если это FileList, загружаем файл
          else if (
            typeof data.image_src === "object" &&
            data.image_src &&
            "length" in data.image_src &&
            "0" in data.image_src
          ) {
            const fileList = data.image_src as FileList;
            if (fileList.length > 0) {
              const imageResult = await StorageService.uploadTrackImage(
                projectId,
                fileList[0]
              );
              if (!imageResult) {
                throw new Error("Не удалось загрузить изображение");
              }
              imageSrc = imageResult.url;
            } else {
              imageSrc = null;
            }
          }
          // Если это пустой объект или что-то другое, устанавливаем null
          else {
            imageSrc = null;
          }
        } else {
          imageSrc = null;
        }

        // Создаем или обновляем трек
        const trackData: TrackInsert = {
          name: data.name,
          author: data.author,
          audio_src: audioSrc,
          image_src: imageSrc,
          index: data.index === 0 ? availableIndexes[0] : data.index,
          project_id: projectId,
        };

        if (edit) {
          await onUpdate(trackData);
        } else {
          await onCreate(trackData);
        }

        // Закрываем диалог
        // onSuccess?.();
      } catch (error) {
        console.error("Ошибка при создании трека:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [
      onCreate,
      onUpdate,
      projectId,
      audioFile,
      edit,
      isUploading,
      isTrimming,
      trimProgress,
    ]
  );

  return (
    <Fragment>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          {edit ? "Редактировать трек" : "Создать трек"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          {edit
            ? "Внесите изменения в ваш трек"
            : "Заполните информацию о новом треке"}
        </DialogDescription>
      </DialogHeader>
      <Form manager={manager} onSubmit={handleSubmit} className="space-y-6">
        <FormField
          name="name"
          label="Название трека"
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название трека..."
            className="h-12 text-base"
          />
        </FormField>
        <FormField
          name="author"
          label="Автор"
          required
          errorMessage="Автор обязательно"
        >
          <Input
            type="text"
            placeholder="Введите автора..."
            className="h-12 text-base"
          />
        </FormField>
        <FormField
          name="index"
          label="Номер трека"
          help="Если оставить пустым, то номер будет выбран автоматически"
        >
          <Select>
            <SelectTrigger className="w-full min-h-12">
              <SelectValue placeholder="Выберите номер" />
            </SelectTrigger>
            <SelectContent>
              {availableIndexes.map((index) => (
                <SelectItem key={index} value={index.toString()}>
                  {index}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          name="image_src"
          label="Фоновое изображение"
          useController
          help="Не рекомендуется использовать изображения с весом больше 5 МБ"
        >
          {(props) => (
            <FileInput
              {...props}
              accept="image/*"
              maxFiles={1}
              placeholder="Перетащите изображение или загрузите"
              showFileNames={true}
              existingImageUrl={propsDefaultValues?.image_src || undefined}
              bucket="photos"
              folder="tracks"
              defaultTab="upload"
            />
          )}
        </FormField>
        <FormField name="audio_src" label="Аудио" useController>
          {(props) => (
            <AudioInput
              onFileChange={handleAudioFileChange}
              onEditorOpen={handleEditorOpen}
              onTrimProgress={handleTrimProgress}
              {...props}
              placeholder="Перетащите аудио файл или загрузите"
            />
          )}
        </FormField>

        {isTrimming && (
          <div className="w-full mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Обрезка аудио... {Math.round(trimProgress)}%
              </p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${trimProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <FormSubmitButton
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
            disabled={isUploading || isTrimming}
          >
            {isTrimming
              ? "Обрезка аудио..."
              : isUploading
              ? "Загрузка..."
              : edit
              ? "Обновить трек"
              : "Создать трек"}
          </FormSubmitButton>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12"
              disabled={isUploading}
            >
              Отменить
            </Button>
          </DialogClose>
        </DialogFooter>
      </Form>
    </Fragment>
  );
};
