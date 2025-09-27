import { getProjects } from "../../actions/project";
import type { Project } from "../../entities/project";
import { useHttp } from "./use_http";

export function useProjects() {
	
	return useHttp<Project[]>({
		defaultValue: [],
		fetcher: getProjects,
		cache: {
			enabled: true,
			id: "projects:all",
			ttl: 2 * 60 * 1000, // 2 minutes (shorter for list)
		}
	});

	
}
