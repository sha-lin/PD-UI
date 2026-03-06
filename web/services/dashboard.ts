import type {
    DashboardActivityResponse,
    DashboardAlertsResponse,
    DashboardAnalytics,
    DashboardOverview,
    AccountManagerDashboard,
} from "@/types/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const extractErrorDetail = async (response: Response): Promise<string> => {
    try {
        const payload = (await response.json()) as { detail?: string };
        if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
            return payload.detail;
        }
    } catch (_error: unknown) {
    }

    const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
    return errorText;
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
    const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch dashboard overview: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch dashboard analytics: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchDashboardAlerts(): Promise<DashboardAlertsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/system-alerts/?is_active=true&is_dismissed=false&page_size=5`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch dashboard alerts: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchDashboardActivity(): Promise<DashboardActivityResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/activity-log/?ordering=-created_at&page_size=10`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch dashboard activity: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchAccountManagerDashboard(): Promise<AccountManagerDashboard> {
    const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/account-manager/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch account manager dashboard: ${response.status} ${errorText}`);
    }

    return response.json();
}
