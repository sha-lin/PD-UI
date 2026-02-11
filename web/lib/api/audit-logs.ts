import { AuditLogResponse, AuditLogFilters } from "@/types/audit-logs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class AuditLogsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = "AuditLogsApiError";
    }
}

function buildQueryString(filters: AuditLogFilters): string {
    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }
    if (filters.action) {
        params.append("action", filters.action);
    }
    if (filters.model_name) {
        params.append("model_name", filters.model_name);
    }
    if (filters.user) {
        params.append("user", filters.user.toString());
    }
    if (filters.page && filters.page > 1) {
        params.append("page", filters.page.toString());
    }

    return params.toString();
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    const queryString = buildQueryString(filters);
    const url = `${API_BASE_URL}/api/v1/audit-logs/${queryString ? `?${queryString}` : ""}`;

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
                throw new AuditLogsApiError("Authentication required", 401);
            }
            if (response.status === 403) {
                throw new AuditLogsApiError("Access denied", 403);
            }
            throw new AuditLogsApiError("Failed to load audit logs");
        }

        const data: AuditLogResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof AuditLogsApiError) {
            throw error;
        }
        throw new AuditLogsApiError("Unable to load audit logs. Please try again.");
    }
}
