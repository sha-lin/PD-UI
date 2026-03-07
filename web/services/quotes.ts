import type {
    Quote,
    QuoteActionResponse,
    QuoteCostPayload,
    QuoteHistoryResponse,
    QuotesQueryParams,
    QuotesResponse,
    MultiProductQuote,
    QuoteStatsResponse,
    CreateQuoteInput,
} from "@/types/quotes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const buildQueryString = (params: QuotesQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    if (params.productionStatus && params.productionStatus !== "all") {
        searchParams.set("production_status", params.productionStatus);
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

type ApiQuote = Omit<Quote, "total_amount"> & {
    total_amount: number | string | null;
    production_cost?: number | string | null;
};

interface ApiQuotesResponse extends Omit<QuotesResponse, "results"> {
    results: ApiQuote[];
}

const parseMoney = (value: number | string | null): number | null => {
    if (value === null) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizeQuote = (quote: ApiQuote): Quote => {
    return {
        ...quote,
        total_amount: parseMoney(quote.total_amount),
        production_cost: parseMoney(quote.production_cost ?? null),
    };
};

export async function fetchQuotes(params: QuotesQueryParams): Promise<QuotesResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch quotes: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as ApiQuotesResponse;
    return {
        ...payload,
        results: payload.results.map(normalizeQuote),
    };
}

export async function deleteQuote(quoteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/`, {
        method: "DELETE",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to delete quote: ${response.status} ${errorText}`);
    }
}

export async function fetchQuote(quoteId: number): Promise<Quote> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch quote: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as ApiQuote;
    return normalizeQuote(payload);
}

export async function fetchQuoteHistory(quoteId: number): Promise<QuoteHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/history/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch quote history: ${response.status} ${errorText}`);
    }

    return response.json();
}

const postQuoteAction = async (quoteId: number, actionPath: string): Promise<QuoteActionResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/${actionPath}/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed quote action (${actionPath}): ${response.status} ${errorText}`);
    }

    return response.json();
};

export async function sendQuoteToPT(quoteId: number, assignedTo?: number): Promise<QuoteActionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/send_to_pt_for_review/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: assignedTo ? JSON.stringify({ assigned_to: assignedTo }) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to send quote to PT: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function sendQuoteToCustomer(quoteId: number): Promise<QuoteActionResponse> {
    return postQuoteAction(quoteId, "send_to_customer");
}

export async function approveQuote(quoteId: number): Promise<QuoteActionResponse> {
    return postQuoteAction(quoteId, "approve");
}

export async function cloneQuote(quoteId: number): Promise<QuoteActionResponse> {
    return postQuoteAction(quoteId, "clone");
}

export async function costQuote(quoteId: number, payload: QuoteCostPayload): Promise<QuoteActionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/cost/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed quote action (cost): ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchMultiProductQuotes(
    status?: string,
    search?: string
): Promise<MultiProductQuote[]> {
    const params = new URLSearchParams();
    params.set("page_size", "100");
    if (status && status !== "all") {
        params.set("status", status);
    }
    if (search) {
        params.set("search", search);
    }
    params.set("ordering", "-created_at");

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/v1/quotes/?${queryString}`;

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch multi-product quotes: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.results || data;
}

export async function fetchQuoteStats(): Promise<QuoteStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/?page_size=1000`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch quote stats: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const quotes = data.results || [];

    const totalQuotes = quotes.length;
    const draftCount = quotes.filter((q: Quote) => q.status === "Draft").length;
    const pendingCosting = quotes.filter((q: Quote) => q.status === "Sent to PT").length;
    const approvedCount = quotes.filter((q: Quote) => q.status === "Approved").length;
    const lostCount = quotes.filter((q: Quote) => q.status === "Lost").length;
    const totalValue = quotes
        .filter((q: Quote) => q.status !== "Lost")
        .reduce((sum: number, q: Quote) => sum + (parseMoney(q.total_amount) || 0), 0);

    const approvedQuotes = quotes.filter((q: Quote) => q.status === "Approved");
    const avgMargin = approvedQuotes.length > 0
        ? approvedQuotes.reduce((sum: number, q: Quote) => {
            const total = parseMoney(q.total_amount) || 0;
            const cost = parseMoney(q.production_cost ?? null) || 0;
            const margin = total > 0 ? ((total - cost) / total) * 100 : 0;
            return sum + margin;
        }, 0) / approvedQuotes.length
        : 0;

    return {
        total_quotes: totalQuotes,
        pending_costing: pendingCosting,
        total_value: totalValue,
        avg_margin: avgMargin,
        draft_count: draftCount,
        approved_count: approvedCount,
        lost_count: lostCount,
    };
}

export async function fetchMultiProductQuoteDetail(quoteId: string): Promise<MultiProductQuote> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch quote detail: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function createMultiProductQuote(data: CreateQuoteInput): Promise<MultiProductQuote> {
    const payload = {
        client: data.client_id || null,
        lead: data.lead_id || null,
        payment_terms: data.payment_terms,
        include_vat: data.include_vat,
        tax_rate: data.tax_rate,
        shipping_charges: data.shipping_charges || 0,
        adjustment_amount: data.adjustment_amount || 0,
        adjustment_reason: data.adjustment_reason || "",
        customer_notes: data.notes || "",
        custom_terms: data.custom_terms || "",
        status: "Draft",
        channel: "portal",
        line_items: data.line_items.map((item, index) => ({
            product: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_amount: item.discount_amount || 0,
            discount_type: item.discount_type || "percent",
            variable_amount: item.variable_amount || 0,
            customization_level_snapshot: "",
            base_price_snapshot: item.unit_price,
            order: index,
        })),
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to create quote: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function markQuoteLost(quoteId: number, reason: string): Promise<QuoteActionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/mark-lost/`, {
        method: "POST",
        headers: buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to mark quote as lost: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function convertQuoteToJob(quoteId: number): Promise<QuoteActionResponse> {
    return postQuoteAction(quoteId, "approve");
}

export async function downloadQuotePdf(quoteId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/v1/quotes/${quoteId}/download-pdf/`, {
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to download quote PDF: ${response.status} ${errorText}`);
    }

    return response.blob();
}
