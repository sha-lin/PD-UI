import type { Job, JobStatus } from "@/types/jobs";

export type MyJobsTabKey = "pending" | "assigned" | "proofs" | "invoices";

export type DeadlineFilter = "all" | "today" | "week" | "overdue";

export interface ProductionMyJobsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | JobStatus;
    deadline: DeadlineFilter;
}

export interface ProductionJobsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Job[];
}

export interface SendJobToVendorPayload {
    vendor_id: number;
    stage_name: string;
    expected_days: number;
    total_cost: number;
    notes: string;
}

export interface SendJobToVendorResponse {
    detail: string;
    vendor_stage_id: number;
    vendor_name: string;
    expected_completion: string;
    attachments_count: number;
}

export interface JobUploadAttachmentsResponse {
    detail: string;
    uploaded_files: Array<{
        id: number;
        file_name: string;
        file_size: number;
        uploaded_at: string;
    }>;
    total_attachments: number;
}

export interface PurchaseOrderListItem {
    id: number;
    po_number: string | null;
    status: string;
    required_by: string | null;
    total_cost: string | number | null;
    vendor_name?: string | null;
    vendor?: number | { id: number; name?: string | null } | null;
    job_number?: string | null;
    job?: number | { id: number; job_number?: string | null; job_name?: string | null } | null;
}

export interface PurchaseOrdersResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PurchaseOrderListItem[];
}

export interface PurchaseOrderProofListItem {
    id: number;
    status: string;
    proof_type: string | null;
    submitted_at: string | null;
    rejection_reason: string | null;
    purchase_order: number | null;
}

export interface PurchaseOrderProofsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PurchaseOrderProofListItem[];
}

export interface VendorInvoiceListItem {
    id: number;
    invoice_number: string | null;
    status: string;
    total_amount: string | number | null;
    submitted_at: string | null;
    vendor_name?: string | null;
    vendor?: number | { id: number; name?: string | null } | null;
    job?: number | { id: number; job_number?: string | null } | null;
}

export interface VendorInvoicesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: VendorInvoiceListItem[];
}
