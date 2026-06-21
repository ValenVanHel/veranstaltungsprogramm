import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function hasRealSupabaseValue(value: string | undefined): value is string {
  if (!value) return false;
  return !value.includes("DEIN-") && !value.includes("DEIN_");
}

const configuredSupabaseUrl = hasRealSupabaseValue(supabaseUrl) ? supabaseUrl : null;
const configuredSupabaseAnonKey = hasRealSupabaseValue(supabaseAnonKey) ? supabaseAnonKey : null;

export const isSupabaseConfigured = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(configuredSupabaseUrl as string, configuredSupabaseAnonKey as string)
  : null;
