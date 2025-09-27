import {
	createSlide,
	deleteSlide,
	getSlide,
	updateSlide,
} from "@/actions/slide";
import type { Slide, SlideInsert } from "@/entities/slide";
import { useCallback } from "react";
import { toast } from "sonner";
import { cache } from "../cache";
import { useCacheSubscription } from "./use_cache_subscription";
import { useHttp } from "./use_http";

export function useSlide(id: number, disabled?: boolean) {
  const http = useHttp<Slide>({
    defaultValue: null,
    disabled,
    fetcher: async () => await getSlide(id),
    cache: {
      enabled: true,
      id: `slide:${id}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });

  const invalidateCache = () => {
    cache.invalidate(`slide:${id}`);
    cache.invalidate("slides:*");
  };

  const onUpdate = useCallback(
    async (payload: Partial<SlideInsert>) => {
      try {
        const result = await updateSlide(id, payload);
        if (result.data) {
          invalidateCache();
          toast.success("Слайд успешно обновлен");
          return result.data;
        } else {
          toast.error("Не удалось обновить слайд - нет данных");
        }
      } catch (error) {
        toast.error("Не удалось обновить слайд");
        throw error;
      }
    },
    [id, invalidateCache]
  );

  const onCreate = useCallback(async (payload: SlideInsert) => {
    try {
      const result = await createSlide(payload);
      if (result.data) {
        invalidateCache();
        toast.success("Слайд успешно создан");
        return result.data;
      } else {
        toast.error("Не удалось создать слайд - нет данных");
      }
    } catch (error) {
      toast.error("Не удалось создать слайд");
      throw error;
    }
  }, []);

  const onDelete = useCallback(async () => {
    try {
      await deleteSlide(id);
      invalidateCache();
      toast.success("Слайд успешно удален");
    } catch (error) {
      toast.error("Не удалось удалить слайд");
      throw error;
    }
  }, []);

  useCacheSubscription({
    keys: [`slide:${id}`],
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
