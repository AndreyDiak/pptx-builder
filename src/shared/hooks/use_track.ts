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
        
        invalidateCache();
        // Инвалидируем кэш проекта
        cache.invalidate(`project:${payload.project_id}`);
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
      console.log('Starting delete for track id:', id);
      
      // Получаем данные трека для получения project_id
      const trackData = http.data;
      const projectId = trackData?.project_id;
      
      console.log('Track data:', trackData);
      console.log('Project ID from track data:', projectId);
      
      // Удаляем трек из базы данных
      await deleteTrack(id);
      
      // Удаляем трек из track_ids проекта
      if (projectId) {
        console.log('Removing track from project track_ids:', projectId, id);
        await removeTrackFromProject(projectId, id);
        console.log('Successfully removed track from project');
      } else {
        console.log('No project ID found, skipping track_ids update');
      }
      
      // Инвалидируем кэш списка треков для обновления UI
      cache.invalidate("tracks:*");
      
      // Инвалидируем кэш конкретного трека
      cache.invalidate(`track:${id}`);
      
      // Инвалидируем кэш проекта
      if (projectId) {
        console.log('Invalidating project cache:', projectId);
        cache.invalidate(`project:${projectId}`);
      }
      
      toast.success("Трек успешно удален");
    } catch (error) {
      console.error('Error deleting track:', error);
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
