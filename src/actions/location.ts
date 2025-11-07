import type { Tables, TablesInsert } from "supabase/types";
import { supabase } from "../../supabase/client";

export type City = Tables<'cities'>;
export type LocationWithCity = Tables<'locations'> & {
  cities: { id: number; name: string | null } | null;
};
export type Location = LocationWithCity;
export type LocationInsert = TablesInsert<'locations'>;

export function getLocation(id: number) {
  return supabase
    .from('locations')
    .select('*, cities(id, name)')
    .eq('id', id)
    .single();
}

export async function getLocations() {
  return await supabase
    .from('locations')
    .select('*, cities(id, name)')
    .order('name', { ascending: true });
}

export async function createLocation(payload: LocationInsert) {
  return await supabase.from('locations').insert(payload).select().single();
}

export function updateLocation(id: number, payload: Partial<LocationInsert>) {
  return supabase.from('locations').update(payload).eq('id', id).select().single();
}

export async function deleteLocation(id: number) {
  return await supabase.from('locations').delete().eq('id', id);
}

