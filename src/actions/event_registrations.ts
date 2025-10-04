import { supabase } from "../../supabase/client";
import type { EventRegistrationInsert } from "../entities/event_registration/types";

export function getEventRegistration(id: number) {
  return supabase.from('event_registrations').select('*').eq('id', id).single();
}

export async function getEventRegistrations(eventId: number) {
  return await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false });
}

export async function createEventRegistration(payload: EventRegistrationInsert) {
  return await supabase.from('event_registrations').insert(payload).select().single();
}

export function updateEventRegistration(id: number, payload: Partial<EventRegistrationInsert>) {
  return supabase.from('event_registrations').update(payload).eq('id', id).select().single();
}

export function deleteEventRegistration(id: number) {
  return supabase.from('event_registrations').delete().eq('id', id);
}
