import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eufboojrcqcbreqkadvy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmJvb2pyY3FjYnJlcWthZHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzczNjcsImV4cCI6MjA3NDMxMzM2N30.gTQ-QBrS8_vg_yHafjy58xb9uabAC-OnOddatGCjSxo';


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

