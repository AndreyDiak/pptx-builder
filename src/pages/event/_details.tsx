import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvent } from "@/shared/hooks/use_event";
import { Calendar, Clock, Info, MapPin, Users } from "lucide-react";

interface EventDetailsProps {
  eventId: number;
}

export const EventDetails = ({ eventId }: EventDetailsProps) => {
  const { data: event, pending } = useEvent(eventId);

  if (pending) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Мероприятие не найдено</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = new Date(event.event_date) > new Date();

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Информация о мероприятии
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{formatDate(event.event_date)}</p>
              <p className="text-sm text-gray-600">
                {formatTime(event.event_date)}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Место проведения</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {event.max_participants && (
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Максимум участников</p>
                <p className="text-sm text-gray-600">
                  {event.max_participants}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Статус</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  isUpcoming
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isUpcoming ? "Предстоящее" : "Завершено"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
