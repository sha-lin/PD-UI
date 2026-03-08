import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DJANGO_API = process.env.DJANGO_API_URL || 'http://localhost:8000';

async function fetchCsrfToken(sessionId: string | undefined): Promise<{ token: string; cookieValue: string }> {
    const csrfRes = await fetch(`${DJANGO_API}/api/auth/csrf/`, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
            ...(sessionId ? { Cookie: `sessionid=${sessionId}` } : {}),
        },
    });

    if (!csrfRes.ok) {
        return { token: '', cookieValue: '' };
    }

    const data = await csrfRes.json() as { csrfToken: string };
    const setCookie = csrfRes.headers.get('set-cookie') || '';
    const match = setCookie.match(/csrftoken=([^;]+)/);

    return { token: data.csrfToken, cookieValue: match ? match[1] : '' };
}

async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
    const { path } = await params;
    const targetPath = path.join('/');
    const targetUrl = `${DJANGO_API}/${targetPath}/${request.nextUrl.search}`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionid')?.value;

    const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);

    let csrfToken = '';
    let csrfCookieValue = '';

    if (isMutation) {
        ({ token: csrfToken, cookieValue: csrfCookieValue } = await fetchCsrfToken(sessionId));
    }

    const cookieParts: string[] = [];
    if (sessionId) cookieParts.push(`sessionid=${sessionId}`);
    if (csrfCookieValue) cookieParts.push(`csrftoken=${csrfCookieValue}`);

    const forwardHeaders: Record<string, string> = {
        'Accept': request.headers.get('accept') || 'application/json',
    };

    const contentType = request.headers.get('content-type');
    if (contentType) forwardHeaders['Content-Type'] = contentType;
    if (cookieParts.length) forwardHeaders['Cookie'] = cookieParts.join('; ');
    if (csrfToken) {
        forwardHeaders['X-CSRFToken'] = csrfToken;
        forwardHeaders['Referer'] = DJANGO_API;
        forwardHeaders['Origin'] = DJANGO_API;
    }

    const isFormData = contentType?.includes('multipart/form-data');
    let body: BodyInit | undefined;

    if (isMutation) {
        if (isFormData) {
            body = await request.blob();
            delete forwardHeaders['Content-Type'];
        } else {
            body = await request.text();
        }
    }

    const djangoResponse = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body,
        redirect: 'manual',
    });

    const responseBody = await djangoResponse.arrayBuffer();
    const responseContentType = djangoResponse.headers.get('content-type') || 'application/json';

    return new NextResponse(responseBody, {
        status: djangoResponse.status,
        headers: { 'Content-Type': responseContentType },
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
