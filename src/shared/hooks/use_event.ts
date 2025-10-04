import { getEvent } from "../../actions/event";
import type { Event } from "../../entities/event/types";
import { useHttp } from "./use_http";

export function useEvent(id: number, disabled?: boolean) {
  return useHttp<Event>({
    defaultValue: null,
    disabled,
    fetcher: async () => await getEvent(id),
    cache: {
      enabled: true,
      id: `event:${id}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });
}
