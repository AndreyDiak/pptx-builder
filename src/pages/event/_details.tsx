import { DateDisplay } from "@/components/ui/form";
import { PairList } from "@/components/ui/pair_list";
import { useEvent } from "@/shared/hooks/use_event";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { useSize } from "@/shared/hooks/use_size";
import { cn } from "@/shared/utils";

interface EventDetailsProps {
  eventId: number;
}

export const EventDetails = ({ eventId }: EventDetailsProps) => {
  const { data: event, pending } = useEvent(eventId);
  const { data: registrations } = useEventRegistrations(eventId);
  const size = useSize();

  const labelWidth = size === "sm" ? 200 : size === "default" ? 250 : 300;

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
        <p className="text-gray-600">Мероприятие не найдено</p>
      </div>
    );
  }

  const isUpcoming = new Date(event.event_date) > new Date();

  return (
    <div className={cn("", "p-4")}>
      <h2 className="text-xl font-medium">Информация о мероприятии</h2>
      <div className="mt-6">
        {event.description && (
          <div className="text-muted-foreground text-sm mb-4">
            {event.description}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <PairList
            pairs={[
              [
                "Дата и время",
                <DateDisplay
                  date={event.event_date}
                  mode="absolute"
                  showTime={true}
                />,
              ],
              ["Место проведения", event.location || null],
              [
                "Зарегистрировано команд",
                `${registrations?.length || 0}${
                  event.max_teams ? ` / ${event.max_teams}` : ""
                }`,
              ],
              [
                "Статус",
                <span
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
            ]}
            size={size}
            alignValues="left"
            labelWidth={labelWidth}
            className="max-w-md"
          />
        </div>
      </div>
    </div>
  );
};
