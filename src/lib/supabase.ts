import { createClient } from "@supabase/supabase-js";

// Server-side only. Uses service role key to bypass RLS.
// Only import this in API route handlers, never in client components.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
