import type {
    BrandAsset,
    Client,
    ClientContact,
    ClientFormPayload,
    ClientsQueryParams,
    ClientsResponse,
    ComplianceDocument,
} from "@/types/clients";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const buildQueryString = (params: ClientsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.clientType !== "all") {
        searchParams.set("client_type", params.clientType);
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

const normalizeClientPayload = (payload: ClientFormPayload): ClientFormPayload => {
    if (payload.client_type === "B2B") {
        return payload;
    }

    return {
        ...payload,
        company: "",
        vat_tax_id: "",
        kra_pin: "",
        industry: "",
        credit_limit: 0,
        default_markup: 0,
        risk_rating: "Low",
        is_reseller: false,
    };
};

const parseCollectionResponse = <T>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (typeof payload === "object" && payload !== null && "results" in payload) {
        const paginated = payload as PaginatedResponse<T>;
        return paginated.results;
    }

    return [];
};

export async function fetchClients(params: ClientsQueryParams): Promise<ClientsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch clients: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchClient(clientId: number): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch client: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function createClient(payload: ClientFormPayload): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(normalizeClientPayload(payload)),
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to create client: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateClient(clientId: number, payload: ClientFormPayload): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}/`, {
        method: "PATCH",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(normalizeClientPayload(payload)),
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to update client: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function deleteClient(clientId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to delete client: ${response.status} ${errorText}`);
    }
}

export async function fetchClientContacts(clientId: number): Promise<ClientContact[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/client-contacts/?client=${clientId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch client contacts: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as unknown;
    return parseCollectionResponse<ClientContact>(payload);
}

export async function fetchClientBrandAssets(clientId: number): Promise<BrandAsset[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/brand-assets/?client=${clientId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch client brand assets: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as unknown;
    return parseCollectionResponse<BrandAsset>(payload);
}

export async function fetchClientComplianceDocuments(clientId: number): Promise<ComplianceDocument[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/compliance-documents/?client=${clientId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await extractErrorDetail(response);
        throw new Error(`Failed to fetch client compliance documents: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as unknown;
    return parseCollectionResponse<ComplianceDocument>(payload);
}
