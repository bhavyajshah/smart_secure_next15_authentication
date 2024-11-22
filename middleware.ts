import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Security headers
  const headers = new Headers(request.headers);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isPremiumPage = request.nextUrl.pathname.startsWith('/premium');

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next({ headers });
  }

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminPage && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check premium access
  if (isPremiumPage && token.subscription !== 'premium') {
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/premium/:path*',
    '/auth/:path*',
    '/settings/:path*'
  ],
};