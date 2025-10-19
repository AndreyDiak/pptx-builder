import { CalendarMonth } from "@/components/ui/calendar_month";
import { useEvents } from "@/shared/hooks/use_events";
import { useMemo, useState } from "react";

export const CalendarPage = () => {
  const { data: events, pending, error } = useEvents();
  const [, setSelectedDate] = useState<Date | null>(null);

  // Создаем Map дат с количеством мероприятий для быстрого поиска
  const eventsByDate = useMemo(() => {
    const dateMap = new Map<string, number>();
    if (events) {
      events.forEach((event) => {
        // Преобразуем event_date в формат YYYY-MM-DD
        const eventDate = new Date(event.event_date);
        const dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      });
    }
    return dateMap;
  }, [events]);

  // Генерируем 12 месяцев начиная с текущего
  const months = useMemo(() => {
    const currentDate = new Date();
    const monthsArray = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      monthsArray.push({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
      });
    }
    
    return monthsArray;
  }, []);

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    // Здесь можно открыть диалог создания события
    console.log("Add event for date:", date);
  };

  if (pending) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto w-7xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Календарь</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }).map((_, j) => (
                    <div key={j} className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="mx-auto w-7xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Календарь</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Ошибка загрузки</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 flex justify-center">
      <div className="mx-auto w-7xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Календарь</h2>
        
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span className="text-sm text-gray-600">Свободные дни</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">1 мероприятие</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">2 мероприятия</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">3+ мероприятий</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Сегодня</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {months.map(({ year, month }) => (
            <CalendarMonth
              key={`${year}-${month}`}
              year={year}
              month={month}
              eventsByDate={eventsByDate}
              onAddEvent={handleAddEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};