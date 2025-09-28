import { getTracks } from "@/actions/track";
import type { Track } from "@/entities/slide";
import { useCacheSubscription } from "./use_cache_subscription";
import { useHttp } from "./use_http";

export function useTracks(projectId: number) {
  const http = useHttp<Track[]>({
    defaultValue: [],
    disabled: !projectId,
    fetcher: async () => await getTracks(projectId),
    cache: {
      enabled: true,
      id: `tracks:${projectId}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });

  useCacheSubscription({
    keys: [`tracks:${projectId}`],
    onInvalidate: () => {
      http.refresh();
    },
  });

  return http;
}
