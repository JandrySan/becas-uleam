import { createClient } from '@supabase/supabase-js';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase en React');
}

export const supabase = createClient(supabaseUrl, supabaseKey);