export type LPOStatus = "pending" | "approved" | "in_production" | "completed" | "cancelled";

export interface LPO {
    id: number;
    lpo_number: string;
    client: number;
    client_name: string | null;
    quote: number;
    quote_id: string | null;
    status: LPOStatus;
    subtotal: number;
    vat_amount: number;
    total_amount: number;
    payment_terms: string;
    delivery_date: string | null;
    notes: string | null;
    created_at: string;
}

export interface LPOSummary {
    total_amount: number;
    pending_amount: number;
    approved_amount: number;
    in_production_amount: number;
    completed_amount: number;
    cancelled_amount: number;
    total_count: number;
    pending_count: number;
    approved_count: number;
    in_production_count: number;
    completed_count: number;
    cancelled_count: number;
}

export interface LPOResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: LPO[];
    summary: LPOSummary;
}

export interface LPOQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: LPOStatus | "all";
    dateFrom: string;
    dateTo: string;
    ordering: string;
}
