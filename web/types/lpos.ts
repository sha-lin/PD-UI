export type LPOStatus = "pending" | "approved" | "in_production" | "completed" | "cancelled";

export interface LPO {
    id: number;
    lpo_number: string;
    client: number | null;
    client_name: string | null;
    quote: number | null;
    quote_id: string | null;
    status: LPOStatus;
    subtotal: number;
    vat_amount: number;
    total_amount: number;
    payment_terms: string;
    delivery_date: string | null;
    notes: string | null;
    terms_and_conditions?: string | null;
    quickbooks_invoice_id?: string | null;
    quickbooks_invoice_number?: string | null;
    synced_to_quickbooks?: boolean;
    synced_at?: string | null;
    approved_by?: number | null;
    approved_at?: string | null;
    created_by?: number | null;
    created_at: string;
}

export interface LPOUpdatePayload {
    status?: LPOStatus;
    delivery_date?: string | null;
    notes?: string;
    payment_terms?: string;
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
