import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { cache } from "../cache";

interface UseHttpOptions<T> {
  defaultValue: T | null;
	disabled?: boolean;
  fetcher: () => Promise<PostgrestSingleResponse<T>>;
	cache?: {
		enabled: boolean;
		id: string;
		ttl?: number
	}
}

export function useHttp<T>(options: UseHttpOptions<T>) {
  const { 
    fetcher, 
    defaultValue, 
    disabled = false, 
    cache: cacheOptions, 
  } = options;

	const { enabled: useCache, id: cacheId, ttl: cacheTTL } = cacheOptions || { enabled: false, id: '', ttl: 0 };

  const [data, setData] = useState<T | null>(defaultValue);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    // Check cache first if enabled
    if (useCache && cacheId) {
      const cachedData = cache.get<T>(cacheId);
      if (cachedData !== null) {
        setData(cachedData);
        return;
      }
    }

		setError(false);
		setPending(true);
		try {
			const result = await fetcher();
			const resultData = result.data;
			setData(resultData);

      // Cache the result if enabled
      if (useCache && cacheId && resultData !== null) {
        cache.set(cacheId, resultData, cacheTTL);
      }
		} catch {
			setError(true);
		} finally {
			setPending(false);
		}
  }, [fetcher, useCache, cacheId, cacheTTL]);

	useEffect(() => {
		if (!disabled) {
			load()
		}
	},[disabled])

  const refresh = useCallback(() => {
    if (useCache && cacheId) {
      cache.delete(cacheId);
    }
    load();
  }, [load, useCache, cacheId]);

	return {
		data,
		error,
		pending,
		refresh
	}
}
