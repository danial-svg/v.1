import { createClient } from '@supabase/supabase-js';

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const configuredKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

export const supabase = createClient(
  configuredUrl || 'https://placeholder.supabase.co',
  configuredKey || 'placeholder-anon-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
