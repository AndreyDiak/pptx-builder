import type { TrackInsert } from "@/entities/slide";
import { supabase } from "../../supabase/client";

export function getTracks(projectId: number) {
  return supabase.from("tracks").select('*').eq('project_id', projectId);
}

export function getTrack(id: number) {
  return supabase.from("tracks").select('*').eq('id', id).single();
}

export function createTrack(payload: TrackInsert) {
  return supabase.from("tracks").insert(payload).select().single();
}

export function updateTrack(id: number, payload: Partial<TrackInsert>) { 
	return supabase.from("tracks").update(payload).eq('id', id).select().single();
}

export function deleteTrack(id: number) {
	return supabase.from("tracks").delete().eq('id', id);
}
