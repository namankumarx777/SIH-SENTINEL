import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client. Only for Client Components that need direct
 * Supabase interaction (e.g. the login page). Never import server-only
 * modules from here.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}