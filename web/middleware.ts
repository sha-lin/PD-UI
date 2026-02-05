import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const protectedRoutes = ['/dashboard', '/admin', '/client', '/vendor', '/staff'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute) {
        try {
            const sessionCookie = request.cookies.get('sessionid');

            if (!sessionCookie) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const checkResponse = await fetch(`${API_BASE_URL}/api/auth/session/check/`, {
                method: 'GET',
                headers: {
                    Cookie: `sessionid=${sessionCookie.value}`,
                },
            });

            if (!checkResponse.ok) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const data = await checkResponse.json() as { authenticated: boolean };

            if (!data.authenticated) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            return NextResponse.next();
        } catch (error) {
            console.error('Middleware auth check failed:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthRoute) {
        try {
            const sessionCookie = request.cookies.get('sessionid');

            if (sessionCookie) {
                const checkResponse = await fetch(`${API_BASE_URL}/api/auth/session/check/`, {
                    method: 'GET',
                    headers: {
                        Cookie: `sessionid=${sessionCookie.value}`,
                    },
                });

                if (checkResponse.ok) {
                    const data = await checkResponse.json() as { authenticated: boolean };
                    if (data.authenticated) {
                        return NextResponse.redirect(new URL('/dashboard', request.url));
                    }
                }
            }
        } catch (error) {
            console.error('Middleware auth check failed:', error);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/client/:path*',
        '/vendor/:path*',
        '/staff/:path*',
        '/login',
        '/register',
    ],
};
