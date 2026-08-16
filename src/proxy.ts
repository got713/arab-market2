import { NextRequest, NextResponse } from 'next/server';

// Edge-level gate for /admin/*: stops the admin bundle from even rendering
// for a request that has no sign of an authenticated admin session, instead
// of relying only on the client-side check in src/app/admin/layout.tsx.
//
// IMPORTANT — what this cookie is and isn't:
// `am_role` is set client-side (see setEdgeRoleCookie in store/auth-store.ts)
// right after a real `/auth/login` call succeeds. It is a routing hint, not a
// credential — this app authenticates via a Sanctum bearer token kept in
// localStorage (not a cookie), which Edge Middleware cannot read. So this
// check can be spoofed by manually setting the cookie in devtools. That does
// NOT grant real access: every admin API call the resulting page makes still
// requires the actual bearer token, which the Laravel backend independently
// verifies and checks against the admin-access Gate on every request (see
// backend routes/api.php + AppServiceProvider). Spoofing the cookie gets an
// empty shell with no working data, not a security bypass.
//
// A cookie-based Sanctum SPA session would let this check be made
// authoritative at the edge, but that's an architecture change outside this
// fix's scope — see the Phase 1 report for the full trade-off.
export function proxy(request: NextRequest) {
  const role = request.cookies.get('am_role')?.value;

  if (role !== 'admin') {
    const loginUrl = new URL('/account', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
