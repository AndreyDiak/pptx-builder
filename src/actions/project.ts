import { supabase } from "../../supabase/client";
import type { ProjectInsert } from "../entities/project/types";

export function getProject(id: number) {
  return supabase.from('projects').select('*').eq('id', id).single();
}

export async function getProjects() {
  return await supabase.from('projects').select('*');
}

export async function createProject(project: ProjectInsert) {
  return await supabase.from('projects').insert(project).select().single();
}

export function updateProject(id: number, payload: Partial<ProjectInsert>) {
  return supabase.from('projects').update(payload).eq('id', id).select().single();
}

export function deleteProject(id: number) {
  return supabase.from('projects').delete().eq('id', id);
}
