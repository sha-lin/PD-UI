import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, { cache: 'no-store', redirect: 'manual' });
    const data = await response.json() as { csrfToken: string };

    const proxyResponse = NextResponse.json(data);

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
        const match = setCookie.match(/csrftoken=([^;]+)/);
        if (match) {
            proxyResponse.cookies.set('csrftoken', match[1], {
                httpOnly: false,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            });
        }
    }

    return proxyResponse;
}
