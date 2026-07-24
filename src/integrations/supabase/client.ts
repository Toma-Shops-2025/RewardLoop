import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = import.meta.env.VITE_SUPABASE_URL || "https://hlofpkphdkarqdujmanh.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsb2Zwa3BoZGthcnFkdWptYW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTQ1NTMsImV4cCI6MjA5NDM3MDU1M30._IkOTCy5JTgG1sMf2MbcyJm3QRtIXziKjml1sG4er7Q";

// Clean URL
const cleanUrl = url.split('/rest/v1')[0].replace(/\/$/, "");

export const supabase = createClient<Database>(cleanUrl, key, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
