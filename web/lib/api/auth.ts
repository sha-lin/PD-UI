import type { LoginCredentials, RegisterData, ChangePasswordData, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiError {
    error?: string;
    detail?: string;
    message?: string;
    [key: string]: unknown;
}

class AuthApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errors?: Record<string, string[]>
    ) {
        super(message);
        this.name = 'AuthApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ApiError;
        const message = errorData.error || errorData.detail || errorData.message || 'Unable to process request. Please try again.';

        throw new AuthApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}

// Session-based authentication — routes through Next.js proxy so cookies are set on same domain
const PROXY_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

export async function getCsrfToken(): Promise<string> {
    const response = await fetch(`${PROXY_BASE}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await handleResponse<{ csrfToken: string }>(response);
    return data.csrfToken;
}

export async function loginUserSession(credentials: LoginCredentials): Promise<{ success: boolean; user: User }> {
    const response = await fetch(`${PROXY_BASE}/api/auth/session/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    return handleResponse(response);
}

export async function logoutUserSession(): Promise<{ success: boolean }> {
    const response = await fetch(`${PROXY_BASE}/api/auth/session/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    return handleResponse(response);
}

export async function checkSession(): Promise<{ authenticated: boolean; user?: User }> {
    const response = await fetch(`${PROXY_BASE}/api/auth/session/check`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return { authenticated: false };
    }

    return handleResponse(response);
}

export async function getCurrentUser(): Promise<User> {
    const response = await fetch(`${PROXY_BASE}/api/auth/session/check`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await handleResponse<{ authenticated: boolean; user?: User }>(response);

    if (!data.authenticated || !data.user) {
        throw new AuthApiError('Not authenticated', 401);
    }

    return data.user;
}

export async function changePassword(data: ChangePasswordData): Promise<{ detail: string }> {
    const csrfToken = await getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    return handleResponse(response);
}
