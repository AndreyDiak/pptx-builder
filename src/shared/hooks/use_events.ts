import { getEvents } from "../../actions/event";
import type { Event } from "../../entities/event/types";
import { useHttp } from "./use_http";

export function useEvents() {
  return useHttp<Event[]>({
    defaultValue: [],
    fetcher: getEvents,
    cache: {
      enabled: true,
      id: "events:all",
      ttl: 2 * 60 * 1000, // 2 minutes
    }
  });
}
