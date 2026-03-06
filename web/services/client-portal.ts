import type {
    ChangePasswordPayload,
    ClientPortalProfile,
    UpdateClientPortalProfilePayload,
} from "@/types/client-portal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchClientPortalProfile(): Promise<ClientPortalProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/portal/me/`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? "Failed to fetch profile");
    }
    return response.json() as Promise<ClientPortalProfile>;
}

export async function updateClientPortalProfile(
    payload: UpdateClientPortalProfilePayload
): Promise<ClientPortalProfile> {
    const response = await fetch(`${API_BASE_URL}/api/v1/portal/me/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? "Failed to update profile");
    }
    return response.json() as Promise<ClientPortalProfile>;
}

export async function changeClientPortalPassword(
    payload: ChangePasswordPayload
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? "Failed to change password");
    }
}
