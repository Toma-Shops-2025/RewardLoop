import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Standard Lovable-style client with built-in safety
function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  // If keys are missing, we return a client that doesn't crash the app
  // but will log a helpful error in the console.
  if (!url || !key) {
    console.warn("Supabase: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Application may be in a loading state.");
    return createClient<Database>("https://vujmezepstugbhozgtrm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1am1lemVwc3R1Z2Job3pndHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MzI3OTAsImV4cCI6MjA5OTMwODc5MH0.C1pvdemMhaBUD4GDCZ8IePitR6F18JH-QAmkKN9qXcg");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
