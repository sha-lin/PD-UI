import type {
    ClientPortalNotification,
    NotificationsListResponse,
} from "@/types/client-orders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchUnreadNotifications(): Promise<NotificationsListResponse> {
    const response = await fetch(
        `${API_BASE}/api/v1/client-notifications/?is_read=false`,
        { credentials: "include", cache: "no-store" }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }
    return response.json() as Promise<NotificationsListResponse>;
}

export async function markNotificationRead(
    id: number
): Promise<ClientPortalNotification> {
    const response = await fetch(
        `${API_BASE}/api/v1/client-notifications/${id}/mark_read/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        }
    );
    if (!response.ok) {
        throw new Error("Failed to mark notification as read");
    }
    const data = (await response.json()) as { notification: ClientPortalNotification };
    return data.notification;
}
