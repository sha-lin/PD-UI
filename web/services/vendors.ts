import {
    CreateVendorPayload,
    UpdateVendorPayload,
    Vendor,
    VendorsQueryParams,
    VendorsResponse,
    VendorPerformanceScorecard,
    VendorIssue,
    CreateIssuePayload,
    MaterialSubstitution,
    CreateSubstitutionPayload,
    PurchaseOrderBasic,
    VendorInvoice,
    CreateInvoicePayload,
    UpdateInvoicePayload,
    InvoiceStats,
    VendorProof,
    CreateProofPayload,
    ProofStats,
    PurchaseOrder,
    UpdateMilestonePayload,
    POStats,
} from "@/types/vendors";

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

export async function fetchCurrentVendor(): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-self-info/me/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load vendor profile. Please contact support.");
    }

    const data = await response.json();
    return data.results[0];
}

export async function fetchVendorPerformanceScorecard(vendorId: number): Promise<VendorPerformanceScorecard> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-performance/scorecard/?vendor_id=${vendorId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load performance data. Please try again later.");
    }

    return response.json();
}

export async function fetchVendorActivePurchaseOrders(): Promise<PurchaseOrderBasic[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-active-pos/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load purchase orders. Please try again later.");
    }

    return response.json();
}

export async function fetchVendorIssues(): Promise<VendorIssue[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-issues/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load issues. Please try again later.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results ?? []);
}

export async function createVendorIssue(payload: CreateIssuePayload): Promise<VendorIssue> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-issues/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Unable to create issue. Please try again later.");
    }

    return response.json();
}

export async function fetchMaterialSubstitutions(): Promise<MaterialSubstitution[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-material-substitutions/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load substitutions. Please try again later.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results ?? []);
}

export async function createMaterialSubstitution(payload: CreateSubstitutionPayload): Promise<MaterialSubstitution> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-material-substitutions/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Unable to create substitution request. Please try again later.");
    }

    return response.json();
}

export async function fetchVendorInvoices(): Promise<VendorInvoice[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load invoices. Please try again later.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results ?? []);
}

export async function fetchVendorInvoiceStats(): Promise<InvoiceStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/stats/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load invoice statistics. Please try again later.");
    }

    return response.json();
}

export async function createVendorInvoice(payload: CreateInvoicePayload): Promise<VendorInvoice> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Unable to create invoice. Please try again later.");
    }

    return response.json();
}

export async function updateVendorInvoice(invoiceId: number, payload: UpdateInvoicePayload): Promise<VendorInvoice> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/${invoiceId}/`, {
        method: "PATCH",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Unable to update invoice. Please try again later.");
    }

    return response.json();
}

export async function submitVendorInvoice(invoiceId: number): Promise<VendorInvoice> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/${invoiceId}/submit/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to submit invoice. Please try again later.");
    }

    return response.json();
}

export async function deleteVendorInvoice(invoiceId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-invoices/${invoiceId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to delete invoice. Please try again later.");
    }
}

export async function fetchVendorProofs(): Promise<VendorProof[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-proofs/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load proofs. Please try again later.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results ?? []);
}

export async function fetchVendorProofStats(): Promise<ProofStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-proofs/stats/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load proof statistics. Please try again later.");
    }

    return response.json();
}

export async function createVendorProof(payload: CreateProofPayload): Promise<VendorProof> {
    const formData = new FormData();
    formData.append("purchase_order_id", payload.purchase_order_id.toString());
    formData.append("proof_image", payload.proof_image);
    if (payload.description) {
        formData.append("description", payload.description);
    }

    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-proofs/`, {
        method: "POST",
        credentials: "include",
        headers: {
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Unable to submit proof. Please try again later.");
    }

    return response.json();
}

export async function deleteVendorProof(proofId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-proofs/${proofId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to delete proof. Please try again later.");
    }
}

export async function fetchVendorPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-pos/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load purchase orders. Please try again later.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.results ?? []);
}

export async function fetchVendorPOStats(): Promise<POStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-pos/stats/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Unable to load PO statistics. Please try again later.");
    }

    return response.json();
}

export async function acceptPurchaseOrder(poId: number): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-pos/${poId}/accept/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to accept purchase order. Please try again later.");
    }

    return response.json();
}

export async function updatePOMilestone(poId: number, payload: UpdateMilestonePayload): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-pos/${poId}/update_milestone/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Unable to update milestone. Please try again later.");
    }

    return response.json();
}

export async function acknowledgePOAssets(poId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/vendor-portal-pos/${poId}/acknowledge_assets/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unable to acknowledge assets. Please try again later.");
    }
}
