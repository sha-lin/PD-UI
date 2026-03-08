import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    const sessionid = request.cookies.get('sessionid')?.value;

    if (!sessionid) {
        return NextResponse.json({ authenticated: false });
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/session/check/`, {
        headers: { Cookie: `sessionid=${sessionid}` },
        cache: 'no-store',
    });

    if (!response.ok) {
        return NextResponse.json({ authenticated: false });
    }

    const data = await response.json() as Record<string, unknown>;
    return NextResponse.json(data);
}
