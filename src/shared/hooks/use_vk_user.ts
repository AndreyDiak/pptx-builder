import { useCallback, useEffect, useState } from "react";

export interface VkUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200?: string;
  photo_100?: string;
  photo_50?: string;
  screen_name?: string;
  domain?: string;
}

interface VkUsersResponse {
  response: VkUser[];
}

interface VkUserState {
  data: VkUser | null;
  loading: boolean;
  error: string | null;
}

interface VkUsersState {
  data: VkUser[];
  loading: boolean;
  error: string | null;
}

// Простое кэширование в памяти
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = <T>(key: string, data: T, ttl: number = 30 * 60 * 1000) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export function useVkUser(userId: number, enabled: boolean = true) {
  const [state, setState] = useState<VkUserState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    if (!enabled || !userId) return;

    const cacheKey = `vk_user:${userId}`;
    const cachedData = getCachedData<VkUser>(cacheKey);
    
    if (cachedData) {
      setState({ data: cachedData, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const accessToken = import.meta.env.VITE_VK_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error("VK access token не настроен");
      }

      const response = await fetch(
        `/api/vk/users?user_ids=${userId}&fields=photo_200,photo_100,photo_50,screen_name,domain&access_token=${accessToken}&v=5.131`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VkUsersResponse = await response.json();

      if (data.response && data.response.length > 0) {
        const user = data.response[0];
        setCachedData(cacheKey, user);
        setState({ data: user, loading: false, error: null });
      } else {
        throw new Error("Пользователь не найден");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [userId, enabled]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    data: state.data,
    pending: state.loading,
    error: state.error,
    refetch: fetchUser,
  };
}

export function useVkUsers(userIds: number[], enabled: boolean = true) {
  const [state, setState] = useState<VkUsersState>({
    data: [],
    loading: false,
    error: null,
  });

  // Создаем стабильную строку для зависимостей (не мутируем исходный массив)
  const userIdsKey = [...userIds].sort().join(",");

  const fetchUsers = useCallback(async () => {
    if (!enabled || userIds.length === 0) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    // Сортируем и создаем стабильный ключ кэша
    const sortedIds = [...userIds].sort();
    const cacheKey = `vk_users:${sortedIds.join(",")}`;
    const cachedData = getCachedData<VkUser[]>(cacheKey);
    
    if (cachedData) {
      setState({ data: cachedData, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const accessToken = import.meta.env.VITE_VK_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error("VK access token не настроен");
      }

      console.log('VK API: Запрашиваем пользователей:', sortedIds);
      console.log('VK API: Токен настроен:', accessToken ? 'Да' : 'Нет');

      const response = await fetch(
        `/api/vk/users?user_ids=${sortedIds.join(
          ","
        )}&fields=photo_200,photo_100,photo_50,screen_name,domain&access_token=${accessToken}&v=5.131`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VkUsersResponse = await response.json();
      console.log('VK API: Ответ от сервера:', data);

      if (data.response) {
        console.log('VK API: Получены пользователи:', data.response);
        setCachedData(cacheKey, data.response);
        setState({ data: data.response, loading: false, error: null });
      } else {
        console.log('VK API: Пустой ответ от сервера');
        setState({ data: [], loading: false, error: null });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      console.error('VK API: Ошибка при запросе:', error);
      setState({ data: [], loading: false, error: errorMessage });
    }
  }, [userIdsKey, enabled]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data: state.data,
    pending: state.loading,
    error: state.error,
    refetch: fetchUsers,
  };
}
