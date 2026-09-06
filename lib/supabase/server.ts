import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client. Works in Server Components, Route Handlers,
 * and Server Actions. Cookie writes are guarded: when the SDK refreshes
 * tokens from a statically rendered component, cookie mutation is
 * unavailable and the refresh is deferred to the proxy/middleware.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component. Safe to ignore; the proxy.ts
            // middleware runs cookie refresh on the next request.
          }
        },
      },
    },
  );
}