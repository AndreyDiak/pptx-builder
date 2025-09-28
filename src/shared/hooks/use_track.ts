import { addTrackToProject, removeTrackFromProject } from "@/actions/project";
import {
  createTrack,
  deleteTrack,
  getTrack,
  updateTrack
} from "@/actions/track";
import type { Track, TrackInsert } from "@/entities/slide";
import { useCallback } from "react";
import { toast } from "sonner";
import { cache } from "../cache";
import { useCacheSubscription } from "./use_cache_subscription";
import { useHttp } from "./use_http";

export function useTrack(id: number, disabled?: boolean) {
  const http = useHttp<Track>({
    defaultValue: null,
    disabled,
    fetcher: async () => await getTrack(id),
    cache: {
      enabled: true,
      id: `track:${id}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });

  const invalidateCache = () => {
    cache.invalidate(`track:${id}`);
    cache.invalidate("tracks:*");
  };

  const onUpdate = useCallback(
      async (payload: Partial<TrackInsert>) => {
      try {
        const result = await updateTrack(id, payload);
        if (result.data) {
          invalidateCache();
          toast.success("Трек успешно обновлен");
          return result.data;
        } else {
          toast.error("Не удалось обновить трек - нет данных");
        }
      } catch (error) {
        toast.error("Не удалось обновить трек");
        throw error;
      }
    },
    [id, invalidateCache]
  );

  const onCreate = useCallback(async (payload: TrackInsert) => {
    try {
      const result = await createTrack(payload);
      
      if (result.data) {
        if (payload.project_id) {
          await addTrackToProject(payload.project_id, result.data.id);
        }
        
        // Инвалидируем кэш списка треков, чтобы он обновился с сервера
        const tracksCacheKey = `tracks:${payload.project_id}`;
        cache.invalidate(tracksCacheKey);
        
        // Инвалидируем кэш проекта, чтобы он обновился с сервера
        const projectCacheKey = `project:${payload.project_id}`;
        cache.invalidate(projectCacheKey);
        
        toast.success("Трек успешно создан");
        return result.data;
      } else {
        toast.error("Не удалось создать трек - нет данных");
      }
    } catch (error) {
      toast.error("Не удалось создать трек");
      throw error;
    }
  }, []);

  const onDelete = useCallback(async () => {
    try {
      // Получаем данные трека из кэша или из базы данных
      let trackData = http.data;
      let projectId = trackData?.project_id;
      
      // Если данные трека не загружены в кэше, получаем их из БД
      if (!trackData || !projectId) {
        const { data: fetchedTrack, error: fetchError } = await getTrack(id);
        if (fetchError) {
          throw fetchError;
        }
        trackData = fetchedTrack;
        projectId = trackData?.project_id;
      }
      
      // Сначала удаляем трек из track_ids проекта
      if (projectId) {
        await removeTrackFromProject(projectId, id);
      }
      
      // Затем удаляем трек из базы данных
      await deleteTrack(id);
      
      // Удаляем кэш конкретного трека
      cache.invalidate(`track:${id}`);
      
      // Инвалидируем кэш списка треков и проекта, чтобы они обновились с сервера
      if (projectId) {
        cache.invalidate(`tracks:${projectId}`);
        cache.invalidate(`project:${projectId}`);
      }
      
      toast.success("Трек успешно удален");
    } catch (error) {
      toast.error("Не удалось удалить трек");
      throw error;
    }
  }, [id, http.data]);

  useCacheSubscription({
    keys: [`track:${id}`],
    onInvalidate: () => {
      http.refresh();
    },
  });

  return {
    ...http,
    onCreate,
    onDelete,
    onUpdate,
  };
}
