import { LPO, LPOQueryParams, LPOResponse, LPOUpdatePayload } from "@/types/lpos";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const getCsrfToken = (): string | null => {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(`${name}=`)) {
            return decodeURIComponent(trimmed.substring(name.length + 1));
        }
    }
    return null;
};

const buildWriteHeaders = (): HeadersInit => {
    const csrfToken = getCsrfToken();
    return {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

const buildQueryString = (params: LPOQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
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

export async function fetchLpos(params: LPOQueryParams): Promise<LPOResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/lpos/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch LPOs: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateLpo(lpoId: number, payload: LPOUpdatePayload): Promise<LPO> {
    const response = await fetch(`${API_BASE_URL}/api/v1/lpos/${lpoId}/`, {
        method: "PATCH",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to update LPO: ${response.status} ${errorText}`);
    }

    return response.json();
}
