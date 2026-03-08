import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    const sessionid = request.cookies.get('sessionid')?.value;

    const csrfResponse = await fetch(`${API_BASE_URL}/api/auth/csrf/`, { cache: 'no-store' });
    const { csrfToken } = await csrfResponse.json() as { csrfToken: string };
    const csrfSetCookie = csrfResponse.headers.get('set-cookie') || '';
    const csrfCookieMatch = csrfSetCookie.match(/csrftoken=([^;]+)/);
    const csrfCookieValue = csrfCookieMatch ? csrfCookieMatch[1] : '';

    if (sessionid) {
        await fetch(`${API_BASE_URL}/api/auth/session/logout/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Cookie': `sessionid=${sessionid}; csrftoken=${csrfCookieValue}`,
            },
        });
    }

    const proxyResponse = NextResponse.json({ success: true });
    proxyResponse.cookies.delete('sessionid');
    return proxyResponse;
}
