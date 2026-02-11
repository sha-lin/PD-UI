import {
    QCInspectionsQueryParams,
    QCInspectionsResponse,
    QCInspection,
    UpdateQCInspectionPayload,
} from "@/types/quality-control";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: QCInspectionsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.vendor && params.vendor !== "all") {
        searchParams.set("vendor", params.vendor);
    }

    if (params.inspector && params.inspector !== "all") {
        searchParams.set("inspector", params.inspector);
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

export async function fetchQCInspections(
    params: QCInspectionsQueryParams
): Promise<QCInspectionsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/qc-inspections/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch QC inspections: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateQCInspection(
    inspectionId: number,
    payload: UpdateQCInspectionPayload
): Promise<QCInspection> {
    const response = await fetch(`${API_BASE_URL}/api/v1/qc-inspections/${inspectionId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to update QC inspection: ${response.status} ${errorText}`);
    }

    return response.json();
}
