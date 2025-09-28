import type { Tables, TablesInsert } from "supabase/types";

export interface Track extends Tables<'tracks'> {}

export interface TrackInsert extends TablesInsert<'tracks'> {}