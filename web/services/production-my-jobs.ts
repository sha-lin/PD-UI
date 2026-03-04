import type {
    JobUploadAttachmentsResponse,
    PurchaseOrderProofsResponse,
    PurchaseOrdersResponse,
    SendJobToVendorPayload,
    SendJobToVendorResponse,
    VendorInvoicesResponse,
} from "@/types/production-my-jobs";

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

const parseText = async (response: Response): Promise<string> => {
    const text = await response.text().catch((_error: unknown): string => "Unknown error");
    return text;
};

const parseListResponse = async <T>(response: Response): Promise<{ count: number; next: string | null; previous: string | null; results: T[] }> => {
    const data = await response.json();

    if (Array.isArray(data)) {
        return {
            count: data.length,
            next: null,
            previous: null,
            results: data as T[],
        };
    }

    if (data && typeof data === "object") {
        const typed = data as { count?: number; next?: string | null; previous?: string | null; results?: T[] };
        return {
            count: typed.count ?? (Array.isArray(typed.results) ? typed.results.length : 0),
            next: typed.next ?? null,
            previous: typed.previous ?? null,
            results: Array.isArray(typed.results) ? typed.results : [],
        };
    }

    return {
        count: 0,
        next: null,
        previous: null,
        results: [],
    };
};

const buildWriteHeaders = (): HeadersInit => {
    const csrfToken = getCsrfToken();
    return {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

export async function fetchPurchaseOrders(status: string): Promise<PurchaseOrdersResponse> {
    const query = new URLSearchParams();
    if (status.trim()) {
        query.set("status", status.trim());
    }
    query.set("page_size", "200");

    const response = await fetch(`${API_BASE_URL}/api/v1/purchase-orders/?${query.toString()}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to fetch purchase orders: ${response.status} ${errorText}`);
    }

    return parseListResponse(response);
}

export async function fetchPurchaseOrderProofs(status: string): Promise<PurchaseOrderProofsResponse> {
    const query = new URLSearchParams();
    if (status.trim()) {
        query.set("status", status.trim());
    }
    query.set("page_size", "200");

    const response = await fetch(`${API_BASE_URL}/api/v1/purchase-order-proofs/?${query.toString()}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to fetch proofs: ${response.status} ${errorText}`);
    }

    return parseListResponse(response);
}

export async function fetchVendorInvoices(status: string): Promise<VendorInvoicesResponse> {
    const query = new URLSearchParams();
    if (status.trim()) {
        query.set("status", status.trim());
    }
    query.set("page_size", "200");

    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-invoices/?${query.toString()}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to fetch invoices: ${response.status} ${errorText}`);
    }

    return parseListResponse(response);
}

export async function sendJobToVendor(jobId: number, payload: SendJobToVendorPayload): Promise<SendJobToVendorResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/send_to_vendor/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to send job to vendor: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function uploadJobAttachments(jobId: number, files: File[]): Promise<JobUploadAttachmentsResponse> {
    const csrfToken = getCsrfToken();
    const formData = new FormData();
    files.forEach((file: File): void => {
        formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/upload_attachments/`, {
        method: "POST",
        headers: {
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to upload attachments: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function approveProof(proofId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/purchase-order-proofs/${proofId}/approve/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to approve proof: ${response.status} ${errorText}`);
    }
}

export async function rejectProof(proofId: number, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/purchase-order-proofs/${proofId}/reject/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to reject proof: ${response.status} ${errorText}`);
    }
}

export async function approveInvoice(invoiceId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-invoices/${invoiceId}/approve/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to approve invoice: ${response.status} ${errorText}`);
    }
}

export async function rejectInvoice(invoiceId: number, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-invoices/${invoiceId}/reject/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const errorText = await parseText(response);
        throw new Error(`Failed to reject invoice: ${response.status} ${errorText}`);
    }
}
