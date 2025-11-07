import { Card, CardContent } from "@/components/ui/base";
import { EventRegistrationCard } from "@/entities/event_registration/ui/card";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { useVkUsers } from "@/shared/hooks/use_vk_user";
import { cn } from "@/shared/utils";
import { Users } from "lucide-react";
import type { ComponentProps } from "react";

interface EventRegistrationsProps extends ComponentProps<"div"> {
  eventId: number;
}

export const EventRegistrations = ({
  eventId,
  className,
  ...props
}: EventRegistrationsProps) => {
  const {
    data: registrations,
    pending,
    error,
  } = useEventRegistrations(eventId);

  // Получаем уникальные user_id из регистраций
  const userIds = registrations
    ? [...new Set(registrations.map((r) => r.user_id))]
    : [];

  // Запрашиваем информацию о пользователях VK
  const {
    data: vkUsers,
    pending: vkPending,
    error: vkError,
  } = useVkUsers(userIds, !!(registrations && registrations.length > 0));

  // Показываем предупреждение об ошибке VK API, но продолжаем отображение
  if (vkError) {
    console.warn("VK API error:", vkError);
  }

  if (pending || vkPending) {
    return (
      <div className={cn("p-2 md:p-4", className)} {...props}>
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Зарегистрированные команды
            {vkPending && (
              <span className="ml-2 text-sm text-primary">
                (загрузка данных VK...)
              </span>
            )}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-2 md:p-4">
                <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-2 md:p-4", className)} {...props}>
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Зарегистрированные команды
          </h2>
        </div>
        <Card>
          <CardContent className="p-4 md:p-8 text-center">
            <div className="text-destructive">
              <h3 className="text-lg font-medium mb-2">Ошибка загрузки</h3>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("p-2 md:p-4", className)} {...props}>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Зарегистрированные команды
        </h2>
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {registrations.map((registration) => (
            <EventRegistrationCard
              key={registration.id}
              registration={registration}
              vkUsers={vkUsers || []}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 md:p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Пока нет зарегистрированных команд
            </h3>
            <p className="text-muted-foreground">
              Команды появятся здесь после регистрации на мероприятие
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
