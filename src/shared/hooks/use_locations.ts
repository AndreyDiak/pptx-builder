import type { Location } from "@/actions/location";
import { getLocations } from "@/actions/location";
import { useHttp } from "./use_http";

export function useLocations() {
  return useHttp<Location[]>({
    defaultValue: [],
    fetcher: getLocations,
    cache: {
      enabled: true,
      id: "locations:all",
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });
}

