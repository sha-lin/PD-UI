import { AnalyticsData } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch analytics data: ${response.status} ${errorText}`);
    }

    return response.json();
}
