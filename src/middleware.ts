import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;


  if (pathname === '/') {
    return NextResponse.next();
  }


  if (token && (pathname === '/login' || pathname === '/register')) {
    const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/seller/dashboard';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/seller'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }


  if (pathname.startsWith('/seller') && userRole !== 'seller') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};