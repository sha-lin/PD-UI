import type { ProductionUsersResponse } from "@/types/users";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchProductionUsers(): Promise<ProductionUsersResponse> {
    const response = await fetch(`${API_BASE_URL}/api/production-users/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch production users: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return {
            results: data,
            count: data.length,
        };
    }

    return data;
}
