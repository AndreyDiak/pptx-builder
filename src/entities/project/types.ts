import type { Tables, TablesInsert } from "../../../supabase/types";

export interface Project extends Tables<'projects'> {}

export interface ProjectInsert extends TablesInsert<'projects'> {}

