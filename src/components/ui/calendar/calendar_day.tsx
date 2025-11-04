import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base";
import type { Event } from "@/entities/event/types";
import { cn } from "@/shared/utils";
import { Clock, MapPin, Mic, Plus } from "lucide-react";
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
    if (!isCurrentMonth) return "bg-gray-50 border-gray-100 text-gray-400";
    if (eventsCount === 0) return "bg-white border-gray-200 text-gray-700";
    if (eventsCount === 1)
      return "bg-green-100 border-green-300 text-green-800";
    if (eventsCount === 2)
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-red-100 border-red-300 text-red-800";
  };

  const dayContent = (
    <div
      className={cn(
        "relative w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 border-2",
        getEventColorClasses(),
        {
          // Стили для сегодняшнего дня
          "ring-2 ring-blue-500 ring-opacity-50": isToday,

          // Эффекты при наведении
          "hover:scale-105 hover:shadow-md": isCurrentMonth,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isHovered && isCurrentMonth && eventsCount === 0 ? (
        <Plus className="w-5 h-5 text-blue-600" />
      ) : (
        <span className="text-sm font-medium">{day}</span>
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
            <div className="font-semibold text-sm text-gray-700">
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
                  className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {event.name}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.event_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
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
