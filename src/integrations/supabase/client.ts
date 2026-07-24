import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded production fallback
const SUPABASE_URL = "https://hlofpkphdkarqdujmanh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsb2Zwa3BoZGthcnFkdWptYW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTQ1NTMsImV4cCI6MjA5NDM3MDU1M30._IkOTCy5JTgG1sMf2MbcyJm3QRtIXziKjml1sG4er7Q";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
