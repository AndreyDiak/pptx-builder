import type { City } from "@/actions/city";
import { getCities } from "@/actions/city";
import { useHttp } from "./use_http";

export function useCities() {
  return useHttp<City[]>({
    defaultValue: [],
    fetcher: getCities,
    cache: {
      enabled: true,
      id: "cities:all",
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });
}

