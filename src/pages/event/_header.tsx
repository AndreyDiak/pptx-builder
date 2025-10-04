import { NotificationSender } from "@/components/notification_sender";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEvent } from "@/shared/hooks/use_event";
import { BellRing } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface EventHeaderProps {
  eventId: number;
}

export const EventHeader = ({ eventId }: EventHeaderProps) => {
  const { data: event, pending } = useEvent(eventId);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  if (pending) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Мероприятие не найдено
        </h1>
        <p className="text-gray-600">Проверьте правильность ссылки</p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 bg-white z-10 py-4">
        <div className="flex justify-between items-center mb-4 px-4">
          <div>
            <h1 className="text-2xl">{event.name}</h1>
          </div>
          <div className="flex justify-end items-center space-x-2">
            <Link
              to="/events"
              className="text-sm font-medium cursor-pointer hover:underline transition-all duration-300"
              style={{ color: "var(--primary)" }}
            >
              Вернуться на главную
            </Link>
            <Button
              onClick={() => setShowNotificationDialog(true)}
              className="flex items-center gap-2 "
            >
              <BellRing className="h-4 w-4" />
              Отправить уведомление
            </Button>
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
