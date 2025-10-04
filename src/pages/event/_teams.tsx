import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventRegistrations } from "@/shared/hooks/use_event_registrations";
import { useVkUsers, type VkUser } from "@/shared/hooks/use_vk_user";
import { Phone, User, Users } from "lucide-react";

interface EventTeamsProps {
  children?: React.ReactNode;
  eventId: number;
}

export const EventTeams = ({ children, eventId }: EventTeamsProps) => {
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

  console.log({ vkUsers, vkError });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не указано";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Функция для получения информации о пользователе VK
  const getVkUser = (userId: number): VkUser | null => {
    return vkUsers?.find((user) => user.id === userId) || null;
  };

  // Функция для получения аватара пользователя
  const getVkAvatarUrl = (userId: number) => {
    const vkUser = getVkUser(userId);
    return (
      vkUser?.photo_200 ||
      vkUser?.photo_100 ||
      vkUser?.photo_50 ||
      "https://vk.com/images/camera_200.png"
    );
  };

  // Функция для получения полного имени пользователя
  const getVkUserName = (userId: number, fallbackName?: string | null) => {
    const vkUser = getVkUser(userId);
    if (vkUser) {
      return `${vkUser.first_name} ${vkUser.last_name}`;
    }
    return fallbackName || "Имя не указано";
  };

  console.log({
    registrations,
    vkUsers,
    vkError,
    vkPending,
    userIds: userIds.length > 0 ? userIds : "no user IDs",
  });

  if (pending || vkPending) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Зарегистрированные участники
            {vkPending && (
              <span className="ml-2 text-sm text-blue-600">
                (загрузка данных VK...)
              </span>
            )}
          </h2>
          {children}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Зарегистрированные участники
          </h2>
          {children}
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">
              <h3 className="text-lg font-medium mb-2">Ошибка загрузки</h3>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем предупреждение об ошибке VK API, но продолжаем отображение
  if (vkError) {
    console.warn("VK API error:", vkError);
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Зарегистрированные участники
        </h2>
        {children}
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((registration) => (
            <Card
              key={registration.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Участник #{registration.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={getVkAvatarUrl(registration.user_id)}
                      alt={getVkUserName(
                        registration.user_id,
                        registration.user_name
                      )}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://vk.com/images/camera_200.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {getVkUserName(
                        registration.user_id,
                        registration.user_name
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Участник</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {registration.participants_count || 1} участник
                      {registration.participants_count &&
                      registration.participants_count > 1
                        ? "ов"
                        : ""}
                    </span>
                  </div>

                  {registration.user_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{registration.user_phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>ID: {registration.user_id}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Зарегистрирован: {formatDate(registration.registered_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Пока нет зарегистрированных участников
            </h3>
            <p className="text-gray-600">
              Участники появятся здесь после регистрации на мероприятие
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
