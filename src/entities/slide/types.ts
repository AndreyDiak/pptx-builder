import type { Tables, TablesInsert } from "supabase/types";

export interface Slide extends Tables<'slide'> {}

export interface SlideInsert extends TablesInsert<'slide'> {}