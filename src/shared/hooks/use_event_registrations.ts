import { getEventRegistrations } from "../../actions/event_registrations";
import type { EventRegistration } from "../../entities/event_registration/types";
import { useHttp } from "./use_http";

export function useEventRegistrations(eventId: number) {
  return useHttp<EventRegistration[]>({
    defaultValue: [],
    fetcher: () => getEventRegistrations(eventId),
    cache: {
      enabled: true,
      id: `event_registrations:${eventId}`,
      ttl: 2 * 60 * 1000, // 2 minutes
    },
    enabled: !!eventId,
  });
}
