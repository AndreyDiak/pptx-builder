import { Button } from "@/components/ui/base";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { useVkMessages } from "@/shared/hooks/use_vk_messages";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationSenderProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSender = ({
  eventId,
  isOpen,
  onClose,
}: NotificationSenderProps) => {
  const [message, setMessage] = useState("");
  const { data: registrations } = useEventRegistrations(eventId);
  const { sending, error, success, sendBulkMessages, resetState } =
    useVkMessages();

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Введите текст сообщения");
      return;
    }

    if (!registrations || registrations.length === 0) {
      toast.error("Нет зарегистрированных участников");
      return;
    }

    const userIds = registrations.map((r) => r.user_id);

    try {
      const result = await sendBulkMessages(userIds, message);

      if (result.successCount > 0) {
        toast.success(
          `Уведомления отправлены ${result.successCount} из ${result.totalCount} участников`
        );
      }

      if (result.errorCount > 0) {
        toast.warning(`Ошибок при отправке: ${result.errorCount}`);
      }

      if (result.successCount > 0) {
        setMessage("");
        onClose();
      }
    } catch (error) {
      toast.error("Ошибка при отправке уведомлений");
    }
  };

  const handleClose = () => {
    resetState();
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90%] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Отправить уведомление участникам</DialogTitle>
          <DialogDescription>
            Сообщение будет отправлено всем зарегистрированным участникам
            мероприятия
            {registrations && ` (${registrations.length} человек)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текст сообщения
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите текст сообщения"
              className="min-h-[200px] text-base"
              disabled={sending}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                Уведомления успешно отправлены!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Отмена
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending
              ? "Отправка..."
              : `Отправить (${registrations?.length || 0})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
