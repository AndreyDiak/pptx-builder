import { getSlides } from "@/actions/slide";
import type { Slide } from "@/entities/slide";
import { useHttp } from "./use_http";

export function useSlides(projectId: number) {
	return useHttp<Slide[]>({
		defaultValue: [],
		disabled: false,
		fetcher: async () => await getSlides(projectId),
		cache: {
			enabled: true,
			id: `slides:${projectId}`,
			ttl: 2 * 60 * 1000, // 2 minutes (shorter for list)
		}
	});
}