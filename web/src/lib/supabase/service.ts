import { createClient } from '@supabase/supabase-js';

// Service-role client for the cron worker ONLY. Bypasses RLS.
// Never import this from any component or user-facing route.
export function supabaseService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
