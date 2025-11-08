import type { Event } from "@/entities/event/types";
import { CalendarDay } from "./calendar_day";

interface CalendarMonthProps {
  year: number;
  month: number;
  eventsByDate: Map<string, Event[]>;
  onAddEvent?: (date: Date) => void;
}

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const CalendarMonth = ({
  year,
  month,
  eventsByDate,
  onAddEvent,
}: CalendarMonthProps) => {
  const today = new Date();
  const currentDate = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (currentDate.getDay() + 6) % 7; // Понедельник = 0

  // Создаем массив дней для отображения
  const days = [];

  // Добавляем пустые ячейки для начала месяца
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
    days.push({
      day: prevMonthDay.getDate(),
      date: prevMonthDay,
      isCurrentMonth: false,
    });
  }

  // Добавляем дни текущего месяца
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    days.push({
      day,
      date,
      isCurrentMonth: true,
    });
  }

  // Добавляем дни следующего месяца для завершения сетки
  const remainingDays = 42 - days.length; // 6 недель * 7 дней
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonthDay = new Date(year, month + 1, day);
    days.push({
      day,
      date: nextMonthDay,
      isCurrentMonth: false,
    });
  }

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        {monthNames[month]} {year}
      </h3>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs md:text-sm font-medium text-muted-foreground py-1 md:py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData, index) => {
          const dateKey = formatDateKey(dayData.date);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const eventsCount = dayEvents.length;

          return (
            <CalendarDay
              key={index}
              day={dayData.day}
              date={dayData.date}
              events={dayEvents}
              eventsCount={eventsCount}
              isCurrentMonth={dayData.isCurrentMonth}
              isToday={isToday(dayData.date)}
              onAddEvent={onAddEvent}
            />
          );
        })}
      </div>
    </div>
  );
};
