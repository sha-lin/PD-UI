export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type PaymentMethod = "cash" | "mpesa" | "bank_transfer" | "cheque" | "credit_card";

export interface Payment {
    id: number;
    lpo: number;
    lpo_number: string | null;
    client_name: string | null;
    amount: number;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    payment_date: string;
    reference_number: string;
    notes?: string | null;
    created_at?: string;
}

export interface PaymentsSummary {
    total_amount: number;
    completed_amount: number;
    pending_amount: number;
    total_count: number;
    completed_count: number;
    pending_count: number;
    failed_count: number;
    refunded_count: number;
}

export interface PaymentsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Payment[];
    summary: PaymentsSummary;
}

export interface PaymentsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: PaymentStatus | "all";
    method: PaymentMethod | "all";
    dateFrom: string;
    dateTo: string;
    ordering: string;
}
