
import type { SlideInsert } from "@/entities/slide";
import { supabase } from "supabase/client";

export function getSlides(projectId: number) {
  return supabase.from("slide").select('*').eq('project_id', projectId);
}

export function getSlide(id: number) {
  return supabase.from("slide").select('*').eq('id', id).single();
}

export function createSlide(slide: SlideInsert) {
  return supabase.from("slide").insert(slide).select().single();
}

export function updateSlide(id: number, slide: Partial<SlideInsert>) { 
	return supabase.from("slide").update(slide).eq('id', id).select().single();
}

export function deleteSlide(id: number) {
	return supabase.from("slide").delete().eq('id', id);
}
