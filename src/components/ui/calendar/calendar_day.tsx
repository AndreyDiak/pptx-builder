import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base";
import type { Event } from "@/entities/event/types";
import { cn } from "@/shared/utils";
import { Clock, Mic, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface CalendarDayProps {
  day: number;
  date: Date;
  events: Event[];
  eventsCount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  onAddEvent?: (date: Date) => void;
}

export const CalendarDay = ({
  day,
  date,
  events,
  eventsCount,
  isCurrentMonth,
  isToday,
  onAddEvent,
}: CalendarDayProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (eventsCount > 0) {
      setIsOpen(true);
    } else if (onAddEvent) {
      onAddEvent(date);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    });
  };

  // Определяем цвет в зависимости от количества мероприятий
  const getEventColorClasses = () => {
    if (!isCurrentMonth) return "bg-muted/30 border-border/50 text-muted-foreground/50";
    if (eventsCount === 0) return "bg-card border-border text-foreground";
    if (eventsCount === 1)
      return "bg-primary/20 border-primary/40 text-primary dark:bg-primary/30 dark:border-primary/50";
    if (eventsCount === 2)
      return "bg-accent border-accent-foreground/30 text-accent-foreground dark:bg-accent/80";
    return "bg-destructive/20 border-destructive/40 text-destructive dark:bg-destructive/30 dark:border-destructive/50";
  };

  const dayContent = (
    <div
      className={cn(
        "relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 border-2",
        getEventColorClasses(),
        {
          // Стили для сегодняшнего дня
          "ring-2 ring-primary ring-opacity-50": isToday,

          // Эффекты при наведении
          "hover:scale-105 hover:shadow-md": isCurrentMonth,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isHovered && isCurrentMonth && eventsCount === 0 ? (
        <Plus className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      ) : (
        <span className="text-xs md:text-sm font-medium">{day}</span>
      )}
    </div>
  );

  // Если есть мероприятия, показываем popover
  if (eventsCount > 0) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{dayContent}</PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-3">
            <div className="font-semibold text-sm text-foreground">
              {date.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="space-y-2">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="font-medium text-sm text-foreground mb-1">
                    {event.name}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.event_date)}
                    </div>
                    {event.host && (
                      <div className="flex items-center gap-1.5">
                        <Mic className="h-3 w-3" />
                        {event.host}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Если мероприятий нет, просто показываем день
  return dayContent;
};
