import {
    CreateJobVendorStagePayload,
    Job,
    JobVendorStage,
    JobsQueryParams,
    JobsResponse,
    UpdateJobVendorStagePayload,
} from "@/types/jobs";
import { getCsrfToken } from "@/lib/api/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const buildQueryString = (params: JobsQueryParams): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.page.toString());
    searchParams.set("page_size", params.pageSize.toString());

    if (params.search.trim()) {
        searchParams.set("search", params.search.trim());
    }

    if (params.status !== "all") {
        searchParams.set("status", params.status);
    }

    return searchParams.toString();
};

const buildWriteHeaders = async (): Promise<HeadersInit> => {
    const csrfToken = await getCsrfToken();
    return {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };
};

export async function fetchJobs(params: JobsQueryParams): Promise<JobsResponse> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/?${queryString}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch jobs: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchJob(jobId: number): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch job: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchJobVendorStages(jobId: number): Promise<JobVendorStage[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-vendor-stages/?job=${jobId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to fetch job vendor stages: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results ?? [];
}

export async function createJobVendorStage(payload: CreateJobVendorStagePayload): Promise<JobVendorStage> {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-vendor-stages/`, {
        method: "POST",
        headers: await buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to assign vendor: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function updateJobVendorStage(
    stageId: number,
    payload: UpdateJobVendorStagePayload
): Promise<JobVendorStage> {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-vendor-stages/${stageId}/`, {
        method: "PATCH",
        headers: await buildWriteHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to update progress: ${response.status} ${errorText}`);
    }

    return response.json();
}

export interface AssignJobPayload {
    user_id: number;
    assignment_notes?: string;
    remind_days_before?: number;
}

export async function assignJobToProductionTeam(jobId: number, payload: AssignJobPayload): Promise<{ success: boolean; message: string }> {
    const formData = new URLSearchParams();
    formData.append("user_id", payload.user_id.toString());
    if (payload.assignment_notes) {
        formData.append("assignment_notes", payload.assignment_notes);
    }
    if (payload.remind_days_before !== undefined) {
        formData.append("remind_days_before", payload.remind_days_before.toString());
    }

    const csrfToken = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/assign/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        credentials: "include",
        body: formData.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to assign job: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function sendJobReminder(jobId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/job/${jobId}/remind/`, {
        method: "POST",
        headers: await buildWriteHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const errorText = await response.text().catch((_error: unknown): string => "Unknown error");
        throw new Error(`Failed to send reminder: ${response.status} ${errorText}`);
    }

    return response.json();
}
