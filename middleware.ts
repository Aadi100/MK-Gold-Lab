import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware: allow access to the login page (/admin) but require a
// token cookie for other /admin/* paths. This avoids an infinite redirect
// loop while providing basic server-side protection.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Allow the login page and static assets under /admin
  if (pathname === '/admin' || pathname.startsWith('/admin/static')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token');
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
