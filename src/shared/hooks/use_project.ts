import { useCallback } from "react";
import { toast } from "sonner";
import { createProject, deleteProject, getProject, updateProject } from "../../actions/project";
import type { Project, ProjectInsert } from "../../entities/project";
import { cache } from "../cache";
import { useCacheSubscription } from "./use_cache_subscription";
import { useHttp } from "./use_http";

export function useProject(id: number, disabled?: boolean) {
	
	const httpResult = useHttp<Project>({
		defaultValue: null,
		disabled,
		fetcher: async () => await getProject(id),
		cache: {
			enabled: true,
			id: `project:${id}`,
			ttl: 5 * 60 * 1000, // 5 minutes
		}
	});

	// Подписываемся на инвалидацию кеша для этого проекта
	useCacheSubscription({
		keys: [`project:${id}`],
		onInvalidate: () => {
			httpResult.refresh();
		}
	});

	const invalidateCache = () => {
		cache.invalidate(`project:${id}`);
		cache.invalidate('projects:*');
	}

	const onUpdate = useCallback(async (payload: Partial<ProjectInsert>) => {
		try {
			console.log('Updating project with ID:', id, 'payload:', payload);
			const result = await updateProject(id, payload);
			console.log('Update result:', result);
			
			if (result.data) {
				invalidateCache();
				
				toast.success("Проект успешно обновлен");
				return result.data;
			} else {
				console.error('No data in result:', result);
				toast.error("Не удалось обновить проект - нет данных");
			}
		} catch (error) {
			console.error('Update project error:', error);
			toast.error("Не удалось обновить проект");
			throw error;
		}
	}, [id, invalidateCache]);

	const onDelete = useCallback(async () => {
		try {
			await deleteProject(id);			
			invalidateCache();
			
			toast.success("Проект успешно удален");
		} catch (error) {
			toast.error("Не удалось удалить проект");
			throw error;
		}
	}, [id, invalidateCache]);

	const onCreate = useCallback(async (payload: ProjectInsert) => {
		try {
			const result = await createProject(payload);
			
			if (result.data) {
				// Инвалидируем кеш списка проектов
				cache.invalidate('projects:*');
				
				toast.success("Проект успешно создан");
				return result.data;
			}
		} catch (error) {
			toast.error("Не удалось создать проект");
			throw error;
		}
	}, []);

	return {
		...httpResult,
		onCreate,
		onDelete,
		onUpdate,
	};
}