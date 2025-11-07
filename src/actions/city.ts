import type { Tables, TablesInsert } from "supabase/types";
import { supabase } from "../../supabase/client";

export type City = Tables<'cities'>;
export type CityInsert = TablesInsert<'cities'>;

export function getCity(id: number) {
  return supabase.from('cities').select('*').eq('id', id).single();
}

export async function getCities() {
  return await supabase.from('cities').select('*').order('name', { ascending: true });
}

export async function createCity(payload: CityInsert) {
  return await supabase.from('cities').insert(payload).select().single();
}

export function updateCity(id: number, payload: Partial<CityInsert>) {
  return supabase.from('cities').update(payload).eq('id', id).select().single();
}

export async function deleteCity(id: number) {
  return await supabase.from('cities').delete().eq('id', id);
}

