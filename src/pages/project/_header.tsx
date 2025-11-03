import { getTracks } from "@/actions/track";
import { Button, Separator } from "@/components/ui/base";
import { ConfirmDialog, Dialog, DialogContent, DialogTrigger, PresentationOptionsDialog } from "@/components/ui/dialog";
import { DateDisplay } from "@/components/ui/form";
import { CreateProjectDialogForm, type Project } from "@/entities/project";
import {
  generatePresentationHTMLWithAssets,
  generatePresentationZIP,
} from "@/services/presentationGenerator";
import { cn } from "@/shared/utils";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  project: Project;
  onDelete: () => Promise<void>;
}

export const ProjectHeader = ({ project, onDelete }: Props) => {
  const navigate = useNavigate();
  const [_, setOpen] = useState(false);
  const [showPresentationOptions, setShowPresentationOptions] = useState(false);
  const [isCreatingPresentation, setIsCreatingPresentation] = useState(false);
  const showDeadline = project.status === "editing" && project.deadline;

  const completed =
    project.track_ids?.length === project.size_x * project.size_y;

  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Проект успешно удален");
      navigate("/");
    } catch {
      toast.error("Не удалось удалить проект");
    }
  };

  const handleCreatePresentation = () => {
    setShowPresentationOptions(true);
  };

  const handleSelectPresentationOption = async (option: "zip" | "html") => {
    setShowPresentationOptions(false);
    setIsCreatingPresentation(true);

    try {
      // Получаем треки проекта
      const { data: tracks, error } = await getTracks(project.id);

      if (error) {
        toast.error("Не удалось загрузить треки");
        return;
      }

      if (!tracks || tracks.length === 0) {
        toast.error("В проекте нет треков");
        return;
      }

      if (option === "zip") {
        await createZipPresentation(project, tracks);
      } else {
        await createHtmlPresentation(project, tracks);
      }
    } catch (error) {
      console.error("Ошибка создания презентации:", error);
      toast.error(
        `Не удалось создать презентацию: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    } finally {
      setIsCreatingPresentation(false);
    }
  };

  const createZipPresentation = async (project: Project, tracks: any[]) => {
    // Показываем уведомление о начале создания
    toast.info("Создание ZIP архива... Скачивание ассетов");

    try {
      // Создаем ZIP архив
      const zipBlob = await generatePresentationZIP({
        project,
        tracks,
      });

      // Создаем и скачиваем ZIP файл
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `МУЗ_ЛОТО_${project.name.replace(/[^a-zA-Z0-9]/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("ZIP архив успешно создан и скачан");
    } catch (zipError) {
      console.error("Ошибка создания ZIP:", zipError);
      toast.error("Не удалось создать ZIP архив. Попробуйте HTML вариант.");
    }
  };

  const createHtmlPresentation = async (project: Project, tracks: any[]) => {
    // Показываем уведомление о начале создания
    toast.info("Создание HTML файла... Скачивание ассетов");

    try {
      // Создаем HTML с встроенными ассетами
      const htmlContent = await generatePresentationHTMLWithAssets({
        project,
        tracks,
      });

      // Создаем и скачиваем HTML файл
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `МУЗ_ЛОТО_${project.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("HTML файл успешно создан и скачан");
    } catch (htmlError) {
      console.error("Ошибка создания HTML:", htmlError);
      toast.error("Не удалось создать HTML файл");
    }
  };

  return (
    <div className="sticky top-0 bg-white z-10 py-4">
      <div
        className={cn(
          "grid items-center mb-4 px-4",
          showDeadline
            ? "grid-cols-[1fr_1fr_2fr] 2xl:grid-cols-[3fr_1fr_3fr]"
            : "grid-cols-[1fr_auto]"
        )}
      >
        <h1 className="text-2xl">{project.name}</h1>
        {showDeadline && (
          <div className="2xl:text-center text-muted-foreground">
            Дедлайн{" "}
            <DateDisplay
              date={project.deadline!}
              mode="relative"
              className="font-normal text-md"
            />
          </div>
        )}
        <div className="flex justify-end items-center space-x-2">
          <Link
            to="/"
            className="text-sm font-medium cursor-pointer hover:underline transition-all duration-300"
            style={{ color: "var(--primary)" }}
          >
            Вернуться на главную
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Редактировать</Button>
            </DialogTrigger>
            <DialogContent className="w-[540px] overflow-y-auto custom-scrollbar dialog-max-height">
              <CreateProjectDialogForm
                defaultValues={project || undefined}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            disabled={!completed || isCreatingPresentation}
            onClick={handleCreatePresentation}
          >
            {isCreatingPresentation ? "Создание..." : "Создать презентацию"}
          </Button>

          <ConfirmDialog
            variant="destructive"
            title="Удаление проекта"
            description="Вы уверены, что хотите удалить проект? Это действие не может быть отменено."
            confirmText="Удалить проект"
            onConfirm={handleDelete}
          >
            <Button size="sm" variant="destructive">
              Удалить
            </Button>
          </ConfirmDialog>
        </div>

        {/* Диалог выбора формата презентации */}
        <PresentationOptionsDialog
          open={showPresentationOptions}
          onOpenChange={setShowPresentationOptions}
          onSelectOption={handleSelectPresentationOption}
        />
      </div>
      <Separator className="w-full" />
    </div>
  );
};
