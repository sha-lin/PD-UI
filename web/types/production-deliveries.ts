import type { Delivery, StagingLocation } from "@/types/deliveries";

export type ProductionQCStatus = "pending" | "passed" | "failed" | "rework";

export interface PackagingVerification {
    boxes_sealed: boolean;
    job_labels: boolean;
    quantity_marked: boolean;
    total_quantity: boolean;
    fragile_stickers: boolean;
}

export interface ProductionHandoffQueueItem {
    job_id: number;
    job_number: string | null;
    job_name: string;
    client_name: string | null;
    product: string;
    quantity: number;
    job_status: string;
    expected_completion: string | null;
    quote_id: string | null;
    person_in_charge_id: number | null;
    qc_status: string | null;
    qc_checked_at: string | null;
    qc_inspection_id: number | null;
    qc_notes: string;
    qc_color_accuracy: boolean;
    qc_print_quality: boolean;
    qc_cutting_accuracy: boolean;
    qc_finishing_quality: boolean;
    qc_quantity_verified: boolean;
    qc_packaging_checked: boolean;
    is_ready_for_handoff: boolean;
    existing_delivery_id: number | null;
    existing_staging_location: StagingLocation | null;
    existing_mark_urgent: boolean;
}

export interface SubmitProductionQCForJobPayload {
    job_id: number;
    status: ProductionQCStatus;
    notes: string;
    color_accuracy: boolean;
    print_quality: boolean;
    cutting_accuracy: boolean;
    finishing_quality: boolean;
    quantity_verified: boolean;
    packaging_checked: boolean;
}

export interface SubmitProductionQCForJobResponse {
    detail: string;
    inspection: {
        id: number;
        job: number;
        status: ProductionQCStatus;
        notes: string;
        color_accuracy: boolean;
        print_quality: boolean;
        cutting_accuracy: boolean;
        finishing_quality: boolean;
        quantity_verified: boolean;
        packaging_checked: boolean;
    };
}

export interface ProductionHandoffQueueResponse {
    count: number;
    ready_count: number;
    blocked_count: number;
    results: ProductionHandoffQueueItem[];
}

export interface CompleteProductionHandoffPayload {
    job_id: number;
    staging_location: StagingLocation;
    packaging_verified: PackagingVerification;
    package_photos: string[];
    notes_to_am: string;
    locked_evp?: string;
    actual_cost?: string;
    mark_urgent: boolean;
    notify_am: boolean;
    notify_via_email: boolean;
}

export interface CompleteProductionHandoffResponse {
    detail: string;
    delivery: Delivery;
}
