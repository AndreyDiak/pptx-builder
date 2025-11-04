import { DateDisplay } from "@/components/ui/form";
import { PairList } from "@/components/ui/pair_list";
import { useEvent } from "@/shared/hooks/use_event";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { useSize } from "@/shared/hooks/use_size";
import { cn } from "@/shared/utils";

interface EventDetailsProps {
  eventId: number;
  isMobileTab?: boolean;
}

export const EventDetails = ({
  eventId,
  isMobileTab = false,
}: EventDetailsProps) => {
  const { data: event, pending } = useEvent(eventId);
  const { data: registrations } = useEventRegistrations(eventId);
  const size = useSize();

  const labelWidth = size === "sm" ? 200 : size === "default" ? 250 : 300;
  const pairListSize = isMobileTab ? "lg" : size === "sm" ? "default" : size;
  const alignValues = isMobileTab ? "right" : "left";

  if (pending) {
    return (
      <div className="p-2 md:p-4">
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
      <div className="p-2 md:p-4">
        <p className="text-gray-600">Мероприятие не найдено</p>
      </div>
    );
  }

  const isUpcoming = new Date(event.event_date) > new Date();

  const pairs: Array<[string, React.ReactNode]> = [
    [
      "Дата и время",
      <DateDisplay date={event.event_date} mode="absolute" showTime={true} />,
    ],
    ["Место проведения", event.location || null],
    ["Ведущий", event.host || null],
    [
      "Зарегистрировано команд",
      `${registrations?.length || 0}${
        event.max_teams ? ` / ${event.max_teams}` : ""
      }`,
    ],
    [
      "Стоимость участия",
      event.price !== null && event.price !== undefined
        ? `${event.price.toLocaleString("ru-RU")} ₽`
        : "Бесплатно",
    ],
    [
      "Статус",
      <span
        key="status"
        className={cn(
          "inline-block px-2 py-1 rounded-full text-xs font-medium",
          isUpcoming
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {isUpcoming ? "Предстоящее" : "Завершено"}
      </span>,
    ],
  ];

  return (
    <div className={cn("", "p-2 md:p-4")}>
      <h2 className="text-xl font-medium">Информация о мероприятии</h2>
      <div className="mt-6">
        {event.description && (
          <div className="text-muted-foreground text-sm mb-4">
            {event.description}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <PairList
            pairs={pairs}
            size={pairListSize}
            alignValues={alignValues}
            labelWidth={labelWidth}
            className={isMobileTab ? "w-full" : "max-w-md"}
          />
        </div>
      </div>
    </div>
  );
};
