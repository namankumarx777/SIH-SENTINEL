import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — runs on every matched request.
 *
 * Responsibilities:
 * 1. Refresh the Supabase session (rotate access/refresh tokens).
 * 2. Redirect unauthenticated requests to /login.
 * 3. Redirect already-authenticated users away from /login.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply cookies to both the request (so this middleware sees them) and
          // the response (so the browser receives the refreshed tokens).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — IMPORTANT: do not add any logic between this call
  // and the return; avoid reading request.cookies after this point.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public");

  // Skip public files and API routes
  if (isPublicFile || isApiRoute) {
    return supabaseResponse;
  }

  // Canonicalize /platform/organizations/* to /organizations/*
  if (pathname.startsWith("/platform/organizations")) {
    const canonicalPath = pathname.replace(/^\/platform\/organizations/, "/organizations");
    const targetUrl = new URL(canonicalPath, request.url);
    targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl);
  }

  // Redirect logged-in users away from /login
  if (user && isAuthRoute) {
    const nextPath = request.nextUrl.searchParams.get("next") || "/dashboard";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  // Redirect unauthenticated users to /login
  if (!user && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
