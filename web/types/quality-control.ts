export type QCStatus = "pending" | "passed" | "failed" | "rework";

export interface QCInspection {
    id: number;
    job: number;
    vendor: number | null;
    inspector: number | null;
    job_number: string | null;
    client_name: string | null;
    quote_id: string | null;
    vendor_name: string | null;
    inspector_name: string | null;
    status: QCStatus;
    inspection_date: string;
    color_accuracy: boolean;
    print_quality: boolean;
    cutting_accuracy: boolean;
    finishing_quality: boolean;
    quantity_verified: boolean;
    packaging_checked: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface QCInspectionsSummary {
    total_count: number;
    pending_count: number;
    passed_count: number;
    failed_count: number;
    rework_count: number;
}

export interface QCInspectionsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: QCInspection[];
    summary: QCInspectionsSummary;
}

export interface QCInspectionsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: QCStatus | "all";
    vendor: string;
    inspector: string;
    dateFrom: string;
    dateTo: string;
    ordering: string;
}

export interface UpdateQCInspectionPayload {
    status?: QCStatus;
    notes?: string;
    color_accuracy?: boolean;
    print_quality?: boolean;
    cutting_accuracy?: boolean;
    finishing_quality?: boolean;
    quantity_verified?: boolean;
    packaging_checked?: boolean;
}
