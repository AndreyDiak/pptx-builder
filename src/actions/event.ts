import { supabase } from "../../supabase/client";
import type { EventInsert } from "../entities/event/types";

export function getEvent(id: number) {
  return supabase.from('events').select('*').eq('id', id).single();
}

export async function getEvents() {
  return await supabase.from('events').select('*').order('event_date', { ascending: true });
}

export async function createEvent(payload: EventInsert) {
  return await supabase.from('events').insert(payload).select().single();
}

export function updateEvent(id: number, payload: Partial<EventInsert>) {
  return supabase.from('events').update(payload).eq('id', id).select().single();
}

export function deleteEvent(id: number) {
  return supabase.from('events').delete().eq('id', id);
}
