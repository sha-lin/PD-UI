import { CreateVendorPayload, UpdateVendorPayload, Vendor, VendorsQueryParams, VendorsResponse } from "@/types/vendors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: VendorsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.active !== "all") {
        searchParams.set("active", params.active);
    }

    return searchParams.toString();
};

export async function fetchVendors(params: VendorsQueryParams): Promise<VendorsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch vendors: ${response.status} ${errorText}`);
    }

    return response.json();
}

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

export async function fetchVendor(vendorId: number): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/${vendorId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch vendor: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function createVendor(payload: CreateVendorPayload): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to create vendor: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateVendor(vendorId: number, payload: UpdateVendorPayload): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/${vendorId}/`, {
        method: "PATCH",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to update vendor: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function deleteVendor(vendorId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/${vendorId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to delete vendor: ${response.status} ${errorText}`);
    }
}

export async function inviteVendor(vendorId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendors/${vendorId}/invite/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to invite vendor: ${response.status} ${errorText}`);
    }
}
