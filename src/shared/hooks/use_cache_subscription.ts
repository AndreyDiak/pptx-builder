import { useEffect, useRef } from "react";
import { cache } from "../cache";

interface CacheSubscriptionOptions {
  keys: string[];
  onInvalidate: (key: string) => void;
}

export function useCacheSubscription({ keys, onInvalidate }: CacheSubscriptionOptions) {
  const onInvalidateRef = useRef(onInvalidate);
  onInvalidateRef.current = onInvalidate;

  useEffect(() => {
    const handleInvalidate = (key: string) => {
      const shouldNotify = keys.some(k => key === k || key.startsWith(k + ':') || k.endsWith('*') && key.startsWith(k.slice(0, -1)));
      if (shouldNotify) {
        onInvalidateRef.current(key);
      }
    };

    const unsubscribe = cache.subscribe(handleInvalidate);

    return unsubscribe;
  }, [keys]);
}
