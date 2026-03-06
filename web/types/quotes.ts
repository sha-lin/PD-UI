export type QuoteStatus = "Draft" | "Sent to PT" | "Costed" | "Sent to Customer" | "Approved" | "Lost";

export type QuoteProductionStatus =
    | "pending"
    | "in_progress"
    | "costed"
    | "sent_to_client"
    | "on_hold"
    | "in_production"
    | "completed";

export interface QuoteLineItem {
    id: number;
    quote: number;
    product: number | null;
    product_name: string;
    quantity: number;
    unit_price: number | string | null;
    production_cost?: number | string | null;
}

export interface QuoteCostPayload {
    production_cost: number;
    notes?: string;
}

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
    production_status: QuoteProductionStatus | string;
    production_cost?: number | null;
    production_notes?: string;
    costed_by?: number | null;
    payment_terms: string;
    checkout_status: string;
    reference_number?: string;
    quantity?: number;
    unit_price?: number | string | null;
    client_name?: string;
    lead_name?: string;
    created_by_name?: string;
    line_items?: QuoteLineItem[];
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
    productionStatus?: "all" | QuoteProductionStatus;
}

export type DiscountType = "percent" | "fixed";

export type PaymentTerms =
    | "Prepaid"
    | "Net 7"
    | "Net 15"
    | "Net 30"
    | "Net 60";

export interface QuoteLineItemDetailed extends QuoteLineItem {
    customization_level_snapshot: string;
    base_price_snapshot: number | null;
    line_total: number;
    discount_amount: number;
    discount_type: DiscountType;
    variable_amount: number;
    order: number;
    updated_at: string;
}

export interface MultiProductQuote {
    id: number;
    quote_id: string;
    client_name: string;
    client_id: number | null;
    lead_id: number | null;
    account_manager: string;
    account_manager_id: number | null;
    item_count: number;
    approved_items: number;
    total_value: number;
    total_cost: number;
    margin: number;
    status: QuoteStatus;
    created_date: string;
    valid_until: string;
    days_remaining: number;
    line_items?: QuoteLineItemDetailed[];
    subtotal: number;
    discount_total: number;
    tax_total: number;
    tax_rate: number;
    shipping_charges: number;
    adjustment_amount: number;
    adjustment_reason: string;
    payment_terms: PaymentTerms;
    reference_number: string;
    notes: string;
    terms: string;
    custom_terms: string;
    loss_reason: string;
    include_vat: boolean;
    production_status: string;
    production_cost: number | null;
    production_notes: string;
    created_at: string;
    updated_at: string;
}

export interface QuoteStatsResponse {
    total_quotes: number;
    pending_costing: number;
    total_value: number;
    avg_margin: number;
    draft_count: number;
    approved_count: number;
    lost_count: number;
}

export interface CreateQuoteLineItemInput {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    discount_type?: DiscountType;
    variable_amount?: number;
}

export interface CreateQuoteInput {
    client_id?: number;
    lead_id?: number;
    payment_terms: PaymentTerms;
    include_vat: boolean;
    tax_rate: number;
    shipping_charges?: number;
    adjustment_amount?: number;
    adjustment_reason?: string;
    notes?: string;
    custom_terms?: string;
    line_items: CreateQuoteLineItemInput[];
}
