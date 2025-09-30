import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date_picker";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFile } from "@/shared/hooks/use_file";
import { useProject } from "@/shared/hooks/use_project";
import { Fragment, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Project, ProjectInsert } from "../types";

interface Props {
  defaultValues?: Partial<Project>;
  onSuccess?: () => void;
}

interface FormValues
  extends Omit<ProjectInsert, "deadline" | "front_page_background_src"> {
  name: string;
  description?: string | null;
  deadlineEnabled: boolean;
  deadline?: Date;
  front_page_background_src: string | null | FileList;
  // bgFile?: FileList | string | null; // Может быть FileList, URL строкой или null
}

const defaultValues: FormValues = {
  name: "",
  deadlineEnabled: false,
  deadline: undefined,
  front_page_background_src: null,
};

export const CreateProjectDialogForm = ({
  defaultValues: propsDefaultValues,
  onSuccess,
}: Props) => {
  const navigate = useNavigate();

  const edit = !!propsDefaultValues?.id;

  const { onCreate, onUpdate } = useProject(
    edit ? propsDefaultValues.id! : 0,
    !edit
  );

  const { uploadFile } = useFile({
    bucket: "photos",
    folder: "backgrounds",
  });

  const manager = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
      ...propsDefaultValues,
      deadlineEnabled: !!propsDefaultValues?.deadline,
      deadline: propsDefaultValues?.deadline
        ? new Date(propsDefaultValues?.deadline)
        : undefined,
    },
  });
  const deadlineEnabled = manager.watch("deadlineEnabled");

  const handleSubmit = useCallback(
    async ({ data }: { data: FormValues }) => {
      let backgroundSrc = propsDefaultValues?.front_page_background_src || null;

      // Обрабатываем файл
      if (
        data.front_page_background_src === null ||
        data.front_page_background_src === ""
      ) {
        backgroundSrc = null;
      } else if (
        data.front_page_background_src instanceof FileList &&
        data.front_page_background_src.length > 0
      ) {
        // Новый файл - загружаем
        const file = data.front_page_background_src[0];
        const uploadedUrl = await uploadFile(file);
        if (uploadedUrl) {
          backgroundSrc = uploadedUrl;
        } else {
          toast.error("Не удалось загрузить файл");
          return;
        }
      } else if (
        typeof data.front_page_background_src === "string" &&
        data.front_page_background_src.startsWith("http")
      ) {
        // URL из БД
        backgroundSrc = data.front_page_background_src;
      }

      const projectData: ProjectInsert = {
        name: data.name,
        description: data.description,
        deadline: data.deadlineEnabled
          ? data.deadline?.toISOString()
          : undefined,
        updated_at: new Date().toISOString(),
        size_x: data.size_x,
        size_y: data.size_y,
        front_page_background_src: backgroundSrc,
      };

      try {
        if (edit) {
          await onUpdate(projectData);
          toast.success("Проект успешно обновлен");

          manager.reset(data);
        } else {
          const data = await onCreate(projectData);
          toast.success("Проект успешно создан");

          data && navigate(`/projects/${data?.id}`);
          manager.reset();
        }
        onSuccess?.();
      } catch {
        toast.error("Не удалось обновить проект");
      }
    },
    [edit, propsDefaultValues, manager, onSuccess, uploadFile]
  );

  // Автоматически устанавливаем текущую дату при включении deadlineEnabled только для новых проектов
  useEffect(() => {
    if (deadlineEnabled && !edit) {
      const currentDeadline = manager.getValues("deadline");
      // Устанавливаем текущую дату только если deadline пустое (новый проект)
      if (!currentDeadline) {
        const currentDate = new Date();
        manager.setValue("deadline", currentDate);
      }
    }
  }, [deadlineEnabled, edit, manager]);

  return (
    <Fragment>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">
          {edit
            ? `Редактировать - ${propsDefaultValues?.name}`
            : "Создать проект"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground mt-2">
          {edit
            ? "Внесите изменения в ваш проект"
            : "Заполните информацию о новом проекте"}
        </DialogDescription>
      </DialogHeader>
      <Form manager={manager} onSubmit={handleSubmit} className="space-y-6">
        <FormField
          name="name"
          label="Название проекта"
          required
          errorMessage="Название обязательно"
        >
          <Input
            type="text"
            placeholder="Введите название проекта"
            className="h-12 text-base"
          />
        </FormField>

        <FormField name="description" label="Описание">
          <Textarea
            placeholder="Опишите ваш проект..."
            className="min-h-[100px] text-base"
          />
        </FormField>

        <FormField
          name="size_x"
          label="Количество треков по горизонтали"
          required
          help="Определяет количество колонок в сетке презентации (от 1 до 10)"
        >
          <Input
            type="number"
            placeholder="7"
            min={1}
            className="h-12 text-base"
          />
        </FormField>

        <FormField
          name="size_y"
          label="Количество треков по вертикали"
          required
          help="Определяет количество строк в сетке презентации (от 1 до 10)"
        >
          <Input
            type="number"
            placeholder="7"
            min={1}
            max={10}
            className="h-12 text-base"
          />
        </FormField>
        <FormField
          name="front_page_background_src"
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
              existingImageUrl={
                propsDefaultValues?.front_page_background_src || undefined
              }
              bucket="photos"
              folder="backgrounds"
              defaultTab="upload"
            />
          )}
        </FormField>
        <FormField
          name="deadlineEnabled"
          label="Установить дедлайн"
          useController
        >
          <Switch />
        </FormField>

        {deadlineEnabled && (
          <FormField name="deadline" label="Дедлайн" useController>
            <DatePicker />
          </FormField>
        )}
        <DialogFooter>
          <FormSubmitButton
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            {edit ? "Обновить проект" : "Создать проект"}
          </FormSubmitButton>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="lg" className="h-12">
              Отменить
            </Button>
          </DialogClose>
        </DialogFooter>
      </Form>
    </Fragment>
  );
};
