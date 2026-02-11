export type DeliveryStatus = "staged" | "in_transit" | "delivered" | "failed";

export type DeliveryMethod = "pickup" | "delivery" | "courier";

export type StagingLocation = "shelf-a" | "shelf-b" | "shelf-c" | "warehouse";

export interface Delivery {
    id: number;
    delivery_number: string;
    job: number;
    job_number: string | null;
    client_name: string | null;
    quote_id: string | null;
    delivery_method: DeliveryMethod | null;
    scheduled_delivery_date: string | null;
    status: DeliveryStatus;
    staging_location: StagingLocation;
    handoff_confirmed: boolean;
    handoff_confirmed_at: string | null;
    handoff_confirmed_by: number | null;
    notes_to_am: string | null;
    package_photos: string[];
    packaging_verified: Record<string, boolean> | null;
    mark_urgent: boolean;
    created_at: string;
    updated_at: string;
}

export interface DeliveriesSummary {
    total_count: number;
    staged_count: number;
    in_transit_count: number;
    delivered_count: number;
    failed_count: number;
    urgent_count: number;
    handoff_confirmed_count: number;
}

export interface DeliveriesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Delivery[];
    summary: DeliveriesSummary;
}

export interface DeliveriesQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: DeliveryStatus | "all";
    stagingLocation: StagingLocation | "all";
    handoffConfirmed: "all" | "true" | "false";
    urgentOnly: "all" | "true" | "false";
    method: DeliveryMethod | "all";
    dateFrom: string;
    dateTo: string;
    ordering: string;
}
