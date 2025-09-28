import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm_dialog";
import { DateDisplay } from "@/components/ui/date_display";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CreateProjectDialogForm, type Project } from "@/entities/project";
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
          <DialogContent className="max-h-[85vh] w-[540px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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
  );
};
