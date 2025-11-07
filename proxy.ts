import { NextRequest, NextResponse, ProxyConfig } from "next/server";
import { getServerUser } from "./lib/server/auth";
import { Role } from "@prisma/client";

export async function proxy(req: NextRequest) {
  const session = await getServerUser();
  const pathname = req.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/', '/admin', '/engineer', '/maintenance', '/maintaince'];
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If accessing a protected route without authentication, redirect to login
  if (!session?.user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If not authenticated and not accessing a protected route, allow
  if (!session?.user) {
    return NextResponse.next();
  }

  // User is authenticated - determine their allowed routes
  let allowedRoutes: string[] = [];
  let defaultRoute: string = '/login';
  console.log("Middleware - User Role:", session.user.role, session.user);

  switch (session.user.role) {
    case Role.ADMIN:
      allowedRoutes = ['/admin'];
      defaultRoute = '/admin';
      break;
    case Role.ENGINEER:
      allowedRoutes = ['/engineer'];
      defaultRoute = '/engineer';
      break;
    case Role.MAINTENANCE:
      allowedRoutes = ['/maintenance']; // Support both spellings
      defaultRoute = '/maintenance';
      break;
  }

  // If accessing root path, redirect to user's default route
  if (pathname === '/') {
    return NextResponse.redirect(new URL(defaultRoute, req.url));
  }

  // Check if user is accessing their allowed route
  const isAllowedRoute = allowedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If accessing an allowed route, let them through
  if (isAllowedRoute) {
    return NextResponse.next();
  }

  // If authenticated but accessing wrong route, redirect to their default route
  if (isProtectedRoute) {
    return NextResponse.redirect(new URL(defaultRoute, req.url));
  }

  // For any other routes, allow access
  return NextResponse.next();
}

export const config: ProxyConfig = {
  matcher: [
    '/',
    '/admin/:path*',
    '/engineer/:path*',
    '/maintenance/:path*',
  ],
};