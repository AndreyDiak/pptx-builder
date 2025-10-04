import type { Tables, TablesInsert } from "supabase/types";

export interface Event extends Tables<'events'> {}

export interface EventInsert extends TablesInsert<'events'> {}