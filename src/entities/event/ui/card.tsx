import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/base";
import { useLocation } from "@/shared/hooks/use_event_location";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { Calendar, Clock, CreditCard, MapPin, Mic, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../types";
interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const { data: registrations } = useEventRegistrations(event.id);
  const { data: location, pending: locationPending } = useLocation(event.location_id);

  const getCityName = (location: { cities: { name: string | null } | null } | null) => {
    return location?.cities?.name || null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Moscow",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    });
  };

  const isUpcoming = new Date(event.event_date) > new Date();

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {event.name}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="space-y-3">
          {event.location_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {locationPending ? (
                <span className="text-muted-foreground/60">Загрузка...</span>
              ) : location ? (
                <div>
                  <span className="font-medium text-foreground">
                  {location.name}
                </span>
                {", "}
                <span className="text-muted-foreground">
                  {getCityName(location)}
                </span>
                </div>
              ) : (
                <span className="text-muted-foreground/60">Локация не найдена</span>
              )}
            </div>
          )}
          {event.host && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mic className="h-4 w-4" />
              Ведущий: <span className="font-medium text-foreground">{event.host}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDate(event.event_date)} в{" "}
            <span className="font-medium text-foreground">{formatTime(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Команды: <span className="font-medium text-foreground">{registrations?.length || 0}</span>
            {event.max_teams ? ` / ${event.max_teams}` : ""}
          </div>
          {event.price !== null && event.price !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Стоимость:{" "}
              <span className="font-medium text-foreground">
                {event.price.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
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
