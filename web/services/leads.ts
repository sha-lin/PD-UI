import type { Lead, LeadConvertPayload, LeadConvertResponse, LeadQualifyResponse, LeadsQueryParams, LeadsResponse } from "@/types/leads";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: LeadsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.source !== "all") {
        searchParams.set("source", params.source);
    }

    searchParams.set("ordering", "-created_at");

    return searchParams.toString();
};

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

export async function fetchLeads(params: LeadsQueryParams): Promise<LeadsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch leads: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function deleteLead(leadId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/${leadId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to delete lead: ${response.status} ${errorText}`);
    }
}

export async function fetchLead(leadId: number): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/${leadId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch lead: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function qualifyLead(leadId: number): Promise<LeadQualifyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/${leadId}/qualify/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to qualify lead: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function convertLead(leadId: number, payload: LeadConvertPayload): Promise<LeadConvertResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/${leadId}/convert/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to convert lead: ${response.status} ${errorText}`);
    }

    return response.json();
}
