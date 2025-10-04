import type { Tables, TablesInsert } from "supabase/types";

export interface EventRegistration extends Tables<'event_registrations'> {}

export interface EventRegistrationInsert extends TablesInsert<'event_registrations'> {}
