import { PaymentsQueryParams, PaymentsResponse } from "@/types/payments";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: PaymentsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.method !== "all") {
        searchParams.set("payment_method", params.method);
    }

    if (params.dateFrom) {
        searchParams.set("payment_date__gte", params.dateFrom);
    }

    if (params.dateTo) {
        searchParams.set("payment_date__lte", params.dateTo);
    }

    if (params.ordering) {
        searchParams.set("ordering", params.ordering);
    }

    return searchParams.toString();
};

export async function fetchPayments(params: PaymentsQueryParams): Promise<PaymentsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/payments/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch payments: ${response.status} ${errorText}`);
    }

    return response.json();
}
