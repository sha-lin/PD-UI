import { DeliveriesQueryParams, DeliveriesResponse } from "@/types/deliveries";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: DeliveriesQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.stagingLocation !== "all") {
        searchParams.set("staging_location", params.stagingLocation);
    }

    if (params.handoffConfirmed !== "all") {
        searchParams.set("handoff_confirmed", params.handoffConfirmed);
    }

    if (params.urgentOnly !== "all") {
        searchParams.set("mark_urgent", params.urgentOnly);
    }

    if (params.method !== "all") {
        searchParams.set("job__delivery_method", params.method);
    }

    if (params.dateFrom) {
        searchParams.set("created_at__gte", params.dateFrom);
    }

    if (params.dateTo) {
        searchParams.set("created_at__lte", params.dateTo);
    }

    if (params.ordering) {
        searchParams.set("ordering", params.ordering);
    }

    return searchParams.toString();
};

export async function fetchDeliveries(params: DeliveriesQueryParams): Promise<DeliveriesResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/deliveries/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch deliveries: ${response.status} ${errorText}`);
    }

    return response.json();
}
