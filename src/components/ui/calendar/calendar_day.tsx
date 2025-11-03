import { cn } from "@/shared/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CalendarDayProps {
  day: number;
  date: Date;
  eventsCount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  onAddEvent?: (date: Date) => void;
}

export const CalendarDay = ({
  day,
  date,
  eventsCount,
  isCurrentMonth,
  isToday,
  onAddEvent,
}: CalendarDayProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onAddEvent) {
      onAddEvent(date);
    }
  };

  // Определяем цвет в зависимости от количества мероприятий
  const getEventColorClasses = () => {
    if (!isCurrentMonth) return "bg-gray-50 border-gray-100 text-gray-400";
    if (eventsCount === 0) return "bg-white border-gray-200 text-gray-700";
    if (eventsCount === 1) return "bg-green-100 border-green-300 text-green-800";
    if (eventsCount === 2) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-red-100 border-red-300 text-red-800";
  };

  return (
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
      {isHovered && isCurrentMonth ? (
        <Plus className="w-5 h-5 text-blue-600" />
      ) : (
        <span className="text-sm font-medium">{day}</span>
      )}
    </div>
  );
};
