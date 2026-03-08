import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as Record<string, unknown>;

        const csrfRes = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
            cache: 'no-store',
            redirect: 'manual',
            headers: { 'Accept': 'application/json' },
        });

        if (!csrfRes.ok && csrfRes.status !== 0) {
            return NextResponse.json({ error: 'Unable to process request. Please try again.' }, { status: 502 });
        }

        if (!csrfRes.ok) {
            return NextResponse.json({ error: 'Unable to process request. Please try again.' }, { status: 502 });
        }

        const csrfData = await csrfRes.json() as { csrfToken: string };
        const csrfToken = csrfData.csrfToken;

        const csrfSetCookie = csrfRes.headers.get('set-cookie') || '';
        const csrfCookieMatch = csrfSetCookie.match(/csrftoken=([^;]+)/);
        const csrfCookieValue = csrfCookieMatch ? csrfCookieMatch[1] : '';

        const loginRes = await fetch(`${API_BASE_URL}/api/auth/session/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': csrfToken,
                'Cookie': `csrftoken=${csrfCookieValue}`,
                'Referer': API_BASE_URL,
                'Origin': API_BASE_URL,
            },
            body: JSON.stringify(body),
            redirect: 'manual',
        });

        const rawText = await loginRes.text();
        let loginData: Record<string, unknown> = {};
        try {
            loginData = JSON.parse(rawText) as Record<string, unknown>;
        } catch {
            loginData = {};
        }

        if (!loginRes.ok) {
            return NextResponse.json(
                { error: 'Unable to process request. Please try again.' },
                { status: loginRes.status === 403 ? 401 : loginRes.status }
            );
        }

        const sessionSetCookie = loginRes.headers.get('set-cookie') || '';
        const sessionMatch = sessionSetCookie.match(/sessionid=([^;]+)/);

        const proxyResponse = NextResponse.json(loginData);

        if (sessionMatch) {
            proxyResponse.cookies.set('sessionid', sessionMatch[1], {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return proxyResponse;
    } catch {
        return NextResponse.json({ error: 'Unable to process request. Please try again.' }, { status: 500 });
    }
}
