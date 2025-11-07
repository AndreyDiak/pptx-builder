import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/base";
import { type VkUser } from "@/shared/hooks/use_vk_user";
import { Phone, User, Users } from "lucide-react";
import { type EventRegistration } from "../types";

interface EventRegistrationCardProps {
  registration: EventRegistration;
  vkUsers: VkUser[];
}

export const EventRegistrationCard = ({ registration, vkUsers }: EventRegistrationCardProps) => {

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
    return fallbackName || `Пользователь ${userId}`;
  };

  // Функция для получения никнейма пользователя VK
  const getVkUserNickname = (userId: number) => {
    const vkUser = getVkUser(userId);
    return vkUser?.screen_name || vkUser?.domain || `id${userId}`;
  };

  // Функция для создания ссылки на личные сообщения VK
  const getVkMessageLink = (userId: number) => {
    return `https://vk.com/im?sel=${userId}`;
  };

  // Функция для обработки клика по никнейму
  const handleNicknameClick = (userId: number) => {
    const link = getVkMessageLink(userId);
    window.open(link, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {registration.team_name || `Команда #${registration.id}`}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {registration.participants_count || 1} участник
          {registration.participants_count && registration.participants_count > 1
            ? "ов"
            : ""}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Секция капитана */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Капитан</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
            <button
              onClick={() => handleNicknameClick(registration.user_id)}
              className="text-sm text-primary hover:text-primary/80 hover:underline cursor-pointer"
            >
              @{getVkUserNickname(registration.user_id)}
            </button>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-2">
          {registration.user_phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{registration.user_phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>ID: {registration.user_id}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Зарегистрирован: {formatDate(registration.registered_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};