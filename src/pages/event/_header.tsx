import { deleteEvent } from "@/actions/event";
import { NotificationSender } from "@/components/notification_sender";
import { Button, Separator } from "@/components/ui/base";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { CreateEventDialogForm } from "@/entities/event/ui/create_dialog_form";
import { useEvent } from "@/shared/hooks/use_event";
import { ArrowLeft, BellRing, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EventHeaderProps {
  eventId: number;
}

export const EventHeader = ({ eventId }: EventHeaderProps) => {
  const { data: event, pending, refresh } = useEvent(eventId);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const result = await deleteEvent(eventId);

      if (result.error) {
        toast.error(`Ошибка удаления мероприятия: ${result.error.message}`);
        return;
      }

      toast.success("Мероприятие успешно удалено");
      navigate("/events", { state: { refresh: true } });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Не удалось удалить мероприятие");
    }
  };

  if (pending) {
    return (
      <div className="mb-4 md:mb-6 px-2 md:px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mb-4 md:mb-6 px-2 md:px-4">
        <h1 className="text-lg md:text-2xl font-bold text-foreground mb-2">
          Мероприятие не найдено
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Проверьте правильность ссылки
        </p>
      </div>
    );
  }

  const handleEditSuccess = () => {
    refresh();
    setShowEditDialog(false);
  };

  return (
    <>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="overflow-y-auto custom-scrollbar dialog-max-height">
          <CreateEventDialogForm
            defaultValues={event || undefined}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 py-3 md:py-4 border-b">
        <div className="flex justify-between items-center mb-3 md:mb-4 px-3 md:px-4 gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold truncate text-foreground">
              {event.name}
            </h1>
          </div>
          <div className="flex justify-end items-center gap-1.5 md:gap-2 flex-shrink-0">
            <Button
              variant="outline"
              asChild
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3"
            >
              <Link to="/events">
                <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
                <span className="hidden md:inline">Вернуться на главную</span>
              </Link>
            </Button>
            <Button
              onClick={() => setShowEditDialog(true)}
              variant="outline"
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3"
            >
              <Edit className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">Редактировать</span>
            </Button>
            <Button
              onClick={() => setShowNotificationDialog(true)}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3"
            >
              <BellRing className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">Отправить уведомление</span>
            </Button>
            <ConfirmDialog
              variant="destructive"
              title="Удаление мероприятия"
              description="Вы уверены, что хотите удалить мероприятие? Все связанные регистрации также будут удалены. Это действие не может быть отменено."
              confirmText="Удалить мероприятие"
              onConfirm={handleDelete}
            >
              <Button
                variant="destructive"
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3"
              >
                <Trash2 className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline">Удалить</span>
              </Button>
            </ConfirmDialog>
          </div>
        </div>
        <Separator className="w-full" />
      </div>

      <NotificationSender
        eventId={eventId}
        isOpen={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
      />
    </>
  );
};
