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
  console.log(`removeTrackFromProject called: projectId=${projectId}, trackId=${trackId}`);
  
  // Получаем текущий проект
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('track_ids')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    console.error('Error fetching project:', fetchError);
    throw fetchError;
  }

  console.log('Current project track_ids:', project.track_ids);

  // Удаляем trackId из массива
  const currentTrackIds = project.track_ids || [];
  const updatedTrackIds = currentTrackIds.filter(id => id !== trackId);

  console.log('Updated track_ids:', updatedTrackIds);

  // Обновляем проект
  const result = await supabase
    .from('projects')
    .update({ track_ids: updatedTrackIds })
    .eq('id', projectId)
    .select()
    .single();

  if (result.error) {
    console.error('Error updating project:', result.error);
    throw result.error;
  }

  console.log('Project updated successfully:', result.data);
  return result;
}