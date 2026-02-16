import type {
    Quote,
    QuoteActionResponse,
    QuoteHistoryResponse,
    QuotesQueryParams,
    QuotesResponse,
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

export async function sendQuoteToPT(quoteId: number): Promise<QuoteActionResponse> {
    return postQuoteAction(quoteId, "send_to_pt_for_review");
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
