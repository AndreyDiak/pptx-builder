import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/base";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../types";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const { data: registrations } = useEventRegistrations(event.id);

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
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {event.name}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {formatDate(event.event_date)} в {formatTime(event.event_date)}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            Зарегистрировано: {registrations?.length || 0}
            {event.max_teams ? ` / ${event.max_teams}` : ""} команд
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isUpcoming ? "Предстоящее" : "Завершено"}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/events/${event.id}`}>Подробнее</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
