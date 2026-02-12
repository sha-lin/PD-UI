export type JobStatus = "pending" | "in_progress" | "on_hold" | "completed";

export type JobPriority = "normal" | "high" | "urgent";

export interface JobClientInfo {
    id: number;
    name: string;
    email: string | null;
}

export interface JobUserInfo {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

export interface Job {
    id: number;
    client: JobClientInfo | null;
    quote: number | null;
    job_number: string | null;
    job_name: string;
    job_type: string;
    priority: JobPriority;
    product: string;
    quantity: number;
    status: JobStatus;
    expected_completion: string | null;
    created_at: string;
    person_in_charge: JobUserInfo | null;
}

export interface JobsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Job[];
}

export interface JobsQueryParams {
    page: number;
    pageSize: number;
    search: string;
    status: "all" | JobStatus;
}

export type JobVendorStageStatus = "pending" | "sent_to_vendor" | "in_production" | "completed" | "issues";

export interface JobVendorStage {
    id: number;
    job: number;
    vendor: number;
    stage_order: number;
    stage_name: string;
    status: JobVendorStageStatus;
    progress: number;
    expected_completion: string | null;
    started_at: string | null;
    completed_at: string | null;
    vendor_cost: string | number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateJobVendorStagePayload {
    job: number;
    vendor: number;
    stage_order: number;
    stage_name: string;
    status: JobVendorStageStatus;
    progress: number;
    expected_completion: string | null;
    vendor_cost: string;
    notes: string | null;
}

export type UpdateJobVendorStagePayload = Partial<CreateJobVendorStagePayload>;
