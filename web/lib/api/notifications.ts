import type { NotificationsQuery, NotificationsResponse, UserNotification } from "@/types/notifications";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class NotificationsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "NotificationsApiError";
    }
}

function getCsrfToken(): string | null {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + "=")) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }

    return null;
}

function buildQueryString(query: NotificationsQuery): string {
    const params = new URLSearchParams();

    if (query.search) {
        params.append("search", query.search);
    }

    if (query.notificationType) {
        params.append("notification_type", query.notificationType);
    }

    if (query.unreadOnly) {
        params.append("is_read", "false");
    }

    return params.toString();
}

function normalizeNotifications(payload: unknown): NotificationsResponse {
    if (Array.isArray(payload)) {
        return {
            results: payload as UserNotification[],
            count: payload.length,
        };
    }

    if (typeof payload === "object" && payload !== null && "results" in payload) {
        const typed = payload as { results: UserNotification[]; count?: number };
        return {
            results: typed.results,
            count: typed.count ?? typed.results.length,
        };
    }

    return {
        results: [],
        count: 0,
    };
}

export async function fetchNotifications(query: NotificationsQuery = {}): Promise<NotificationsResponse> {
    const queryString = buildQueryString(query);
    const url = `${API_BASE_URL}/api/v1/notifications/${queryString ? `?${queryString}` : ""}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new NotificationsApiError("Failed to load notifications", response.status);
        }

        const payload = (await response.json()) as unknown;
        return normalizeNotifications(payload);
    } catch (error) {
        if (error instanceof NotificationsApiError) {
            throw error;
        }
        throw new NotificationsApiError("Unable to load notifications. Please try again.");
    }
}

export async function markNotificationRead(notificationId: number): Promise<void> {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/mark_read/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
    });

    if (!response.ok) {
        throw new NotificationsApiError("Failed to mark notification as read", response.status);
    }
}

export async function markAllNotificationsRead(notificationIds: number[]): Promise<void> {
    await Promise.all(notificationIds.map((notificationId: number): Promise<void> => markNotificationRead(notificationId)));
}
