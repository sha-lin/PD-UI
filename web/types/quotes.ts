export type QuoteStatus = "Draft" | "Sent to PT" | "Costed" | "Sent to Customer" | "Approved" | "Lost";

export interface Quote {
    id: number;
    quote_id: string;
    product_name: string;
    client: number | null;
    lead: number | null;
    total_amount: number | null;
    status: QuoteStatus | string;
    quote_date: string;
    valid_until: string;
    created_at: string;
    production_status: string;
    payment_terms: string;
    checkout_status: string;
    reference_number?: string;
    quantity?: number;
    unit_price?: number | string | null;
    client_name?: string;
    lead_name?: string;
    created_by_name?: string;
}

export interface QuoteHistoryItem {
    id: number;
    activity_type: string;
    title: string;
    description: string;
    created_at: string;
}

export interface QuoteHistoryResponse {
    quote_id: string;
    status: string;
    history: QuoteHistoryItem[];
}

export interface QuoteActionResponse {
    detail: string;
    quote?: Quote;
    lpo_id?: number;
    lpo_number?: string;
    job_id?: number;
    job_number?: string;
}

export interface QuotesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Quote[];
}

export interface QuotesQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | QuoteStatus;
}
