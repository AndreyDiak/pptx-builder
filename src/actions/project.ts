import { supabase } from "../../supabase/client";
import type { ProjectInsert } from "../entities/project/types";

export function getProject(id: number) {
  return supabase.from('projects').select('*').eq('id', id).single();
}

export async function getProjects() {
  return await supabase.from('projects').select('*');
}

export async function createProject(payload: ProjectInsert) {
  return await supabase.from('projects').insert(payload).select().single();
}

export function updateProject(id: number, payload: Partial<ProjectInsert>) {
  return supabase.from('projects').update(payload).eq('id', id).select().single();
}

export function deleteProject(id: number) {
  return supabase.from('projects').delete().eq('id', id);
}

export async function addTrackToProject(projectId: number, trackId: number) {
  // Получаем текущий проект
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('track_ids')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Добавляем trackId в массив
  const currentTrackIds = project.track_ids || [];
  const updatedTrackIds = [...currentTrackIds, trackId];

  // Обновляем проект
  return supabase
    .from('projects')
    .update({ track_ids: updatedTrackIds })
    .eq('id', projectId)
    .select()
    .single();
}

export async function removeTrackFromProject(projectId: number, trackId: number) {
  // Получаем текущий проект
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('track_ids')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Удаляем trackId из массива
  const currentTrackIds = project.track_ids || [];
  
  // Проверяем, есть ли trackId в массиве
  if (!currentTrackIds.includes(trackId)) {
    return { data: project, error: null };
  }
  
  const updatedTrackIds = currentTrackIds.filter(id => id !== trackId);

  // Обновляем проект
  const result = await supabase
    .from('projects')
    .update({ track_ids: updatedTrackIds })
    .eq('id', projectId)
    .select()
    .single();

  if (result.error) {
    throw result.error;
  }

  return result;
}