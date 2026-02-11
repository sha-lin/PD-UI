import { SystemSettings, UpdateSettingsPayload } from "@/types/settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class SettingsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "SettingsApiError";
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

export async function fetchSettings(): Promise<SystemSettings> {
    const url = `${API_BASE_URL}/api/v1/settings/`;

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
                throw new SettingsApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new SettingsApiError("Access denied", 403);
            }
            throw new SettingsApiError("Failed to fetch settings");
        }

        const data: SystemSettings = await response.json();
        return data;
    } catch (error) {
        if (error instanceof SettingsApiError) {
            throw error;
        }
        throw new SettingsApiError("Unable to load settings. Please try again.");
    }
}

export async function updateSettings(updates: UpdateSettingsPayload): Promise<SystemSettings> {
    const url = `${API_BASE_URL}/api/v1/settings/bulk_update/`;
    const csrfToken = getCsrfToken();

    try {
        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new SettingsApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new SettingsApiError("Access denied", 403);
            }
            throw new SettingsApiError("Failed to update settings");
        }

        const data: SystemSettings = await response.json();
        return data;
    } catch (error) {
        if (error instanceof SettingsApiError) {
            throw error;
        }
        throw new SettingsApiError("Unable to update settings. Please try again.");
    }
}
