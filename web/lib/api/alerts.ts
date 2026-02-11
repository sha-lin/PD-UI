import { AlertsResponse, AlertFilters, SystemAlert } from "@/types/alerts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class AlertsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "AlertsApiError";
    }
}

function getCsrfToken(): string | null {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + "=")) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }
    return null;
}

function buildQueryString(filters: AlertFilters): string {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }
    if (filters.alert_type) {
        params.append("alert_type", filters.alert_type);
    }
    if (filters.severity) {
        params.append("severity", filters.severity);
    }
    if (filters.is_active !== undefined) {
        params.append("is_active", filters.is_active.toString());
    }
    if (filters.is_dismissed !== undefined) {
        params.append("is_dismissed", filters.is_dismissed.toString());
    }
    if (filters.page && filters.page > 1) {
        params.append("page", filters.page.toString());
    }

    return params.toString();
}

export async function fetchAlerts(filters: AlertFilters = {}): Promise<AlertsResponse> {
    const queryString = buildQueryString(filters);
    const url = `${API_BASE_URL}/api/v1/system-alerts/${queryString ? `?${queryString}` : ""}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new AlertsApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new AlertsApiError("Access denied", 403);
            }
            throw new AlertsApiError("Failed to load alerts");
        }

        const data: AlertsResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof AlertsApiError) {
            throw error;
        }
        throw new AlertsApiError("Unable to load alerts. Please try again.");
    }
}

export async function dismissAlert(alertId: number): Promise<SystemAlert> {
    const url = `${API_BASE_URL}/api/v1/system-alerts/${alertId}/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
            },
            body: JSON.stringify({ is_dismissed: true }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new AlertsApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new AlertsApiError("Access denied", 403);
            }
            throw new AlertsApiError("Failed to dismiss alert");
        }

        const data: SystemAlert = await response.json();
        return data;
    } catch (error) {
        if (error instanceof AlertsApiError) {
            throw error;
        }
        throw new AlertsApiError("Unable to dismiss alert. Please try again.");
    }
}
