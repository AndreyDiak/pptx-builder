import { Link, useNavigate, useParams } from "react-router-dom";
// import type { Project } from "../../types/project";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm_dialog";
import { DateDisplay } from "@/components/ui/date_display";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PairList } from "@/components/ui/pair_list";
import { Separator } from "@/components/ui/separator";
import {
  CreateProjectDialogForm,
  ProjectNoDataDisplay,
  ProjectPendingDisplay,
} from "@/entities/project";
import { useProject } from "@/shared/hooks/use_project";
import { cn } from "@/shared/utils";
import { useState } from "react";
import { toast } from "sonner";

export const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    data: project,
    pending,
    onDelete,
  } = useProject(Number(id), !id || id === "new");

  if (pending) {
    return <ProjectPendingDisplay />;
  }

  if (!project) {
    return <ProjectNoDataDisplay />;
  }

  const slidesCount = project?.slide_ids?.length ?? 0;
  const total = project?.size_x * project?.size_y;

  const showDeadline = project.status === "editing" && project.deadline;

  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Проект успешно удален");
      navigate("/");
    } catch {
      toast.error("Не удалось удалить проект");
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div
        className={cn(
          "grid items-center mb-4",
          showDeadline ? "grid-cols-[3fr_1fr_3fr]" : "grid-cols-[1fr_auto]"
        )}
      >
        <h1 className="text-2xl">{project.name}</h1>
        {showDeadline && (
          <div className="text-center text-muted-foreground">
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
          <Button size="sm" variant="outline" disabled>
            Предпросмотр
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Редактировать</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] w-[540px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <CreateProjectDialogForm
                defaultValues={project || undefined}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>

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
      </div>
      <Separator />
      <div className="w-[500px]">
        <div className="mt-6">
          <div className="text-muted-foreground text-sm mb-4">
            {project.description}
          </div>
          <PairList
            pairs={[
              [
                "Создан",
                <DateDisplay date={project.created_at} mode="absolute" />,
              ],
              [
                "Обновлен",
                project.updated_at ? (
                  <DateDisplay date={project.updated_at} mode="relative" />
                ) : null,
              ],
              ["Количество треков", project.size_x * project.size_y],
              [
                "Крайний срок",
                project.status === "editing" && project.deadline ? (
                  <DateDisplay date={project.deadline} mode="absolute" />
                ) : null,
              ],
              [
                "Готовность",
                project.status === "editing"
                  ? `${((slidesCount / total) * 100).toFixed(0)}%`
                  : "Завершен",
              ],
            ]}
            size="lg"
            alignValues="left"
            labelWidth={180}
            className="max-w-md"
          />
          <Separator className="my-4" />
          {project.bg_href && (
            <div>
              <h2 className="text-base font-medium mb-2">
                Титульное изображение
              </h2>
              <img
                src={project.bg_href}
                alt={project.name}
                className="object-cover w-xl rounded-2xl border border-blue-[var(--border)]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center p-8 gradient-bg-rainbow">
      <div className="flex w-11/12 h-11/12 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};
