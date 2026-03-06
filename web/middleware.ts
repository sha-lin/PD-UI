import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PortalRole } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ROLE_DASHBOARD: Record<PortalRole, string> = {
    client: '/portal',
    admin: '/admin/dashboard',
    account_manager: '/account-manager',
    production_team: '/production/dashboard',
    vendor: '/vendors',
};

const ROUTE_ALLOWED_ROLES: Array<{ prefix: string; roles: PortalRole[] }> = [
    { prefix: '/portal', roles: ['client'] },
    { prefix: '/admin', roles: ['admin'] },
    { prefix: '/production', roles: ['production_team'] },
    { prefix: '/account-manager', roles: ['account_manager'] },
    { prefix: '/vendors', roles: ['vendor'] },
];

interface SessionData {
    authenticated: boolean;
    user?: {
        portal_role: PortalRole | null;
    };
}

async function fetchSessionData(sessionId: string): Promise<SessionData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session/check/`, {
            method: 'GET',
            headers: { Cookie: `sessionid=${sessionId}` },
        });
        if (!response.ok) return null;
        return await response.json() as SessionData;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const matchedRoute = ROUTE_ALLOWED_ROLES.find((r) => pathname.startsWith(r.prefix));
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

    if (matchedRoute) {
        const sessionCookie = request.cookies.get('sessionid');
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const session = await fetchSessionData(sessionCookie.value);
        if (!session?.authenticated) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const role = session.user?.portal_role;
        if (!role || !matchedRoute.roles.includes(role)) {
            const correctDashboard = role ? ROLE_DASHBOARD[role] : '/login';
            return NextResponse.redirect(new URL(correctDashboard, request.url));
        }

        return NextResponse.next();
    }

    if (isAuthRoute) {
        const sessionCookie = request.cookies.get('sessionid');
        if (sessionCookie) {
            const session = await fetchSessionData(sessionCookie.value);
            if (session?.authenticated && session.user?.portal_role) {
                const destination = ROLE_DASHBOARD[session.user.portal_role];
                return NextResponse.redirect(new URL(destination, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/portal/:path*',
        '/portal',
        '/admin/:path*',
        '/admin',
        '/production/:path*',
        '/production',
        '/account-manager/:path*',
        '/account-manager',
        '/vendors/:path*',
        '/vendors',
        '/login',
        '/register',
    ],
};
