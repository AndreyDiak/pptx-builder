import { getLocation } from "@/actions/location";
import type { Location } from "@/actions/location";
import { useHttp } from "./use_http";

export function useLocation(id: number | null | undefined, disabled?: boolean) {
  return useHttp<Location | null>({
    defaultValue: null,
    disabled: disabled || !id,
    fetcher: async () => {
      if (!id) {
        return { data: null, error: null } as any;
      }
      return await getLocation(id);
    },
    cache: {
      enabled: true,
      id: id ? `location:${id}` : '',
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  });
}

