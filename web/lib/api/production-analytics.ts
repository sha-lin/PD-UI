import type { Job, JobsResponse } from "@/types/jobs";
import type {
    JobStatusDistributionItem,
    ProductionAnalyticsData,
    TeamPerformanceItem,
} from "@/types/production-analytics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiError {
    error?: string;
    detail?: string;
    message?: string;
}

class ProductionAnalyticsApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
    ) {
        super(message);
        this.name = "ProductionAnalyticsApiError";
    }
}

const parseApiErrorMessage = (value: unknown): string => {
    if (!value || typeof value !== "object") {
        return "Unable to process request. Please try again.";
    }

    const payload = value as ApiError;
    return payload.error || payload.detail || payload.message || "Unable to process request. Please try again.";
};

const normalizeStatusDistribution = (items: unknown): JobStatusDistributionItem[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item: unknown): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item: Record<string, unknown>): JobStatusDistributionItem => {
            return {
                status: typeof item.status === "string" ? item.status : "unknown",
                count: typeof item.count === "number" ? item.count : 0,
            };
        });
};

const normalizeTeamPerformance = (items: unknown): TeamPerformanceItem[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item: unknown): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item: Record<string, unknown>): TeamPerformanceItem => {
            return {
                user_id: typeof item.user_id === "number" ? item.user_id : 0,
                user_name: typeof item.user_name === "string" ? item.user_name : "Unknown",
                total_jobs: typeof item.total_jobs === "number" ? item.total_jobs : 0,
                completed_jobs: typeof item.completed_jobs === "number" ? item.completed_jobs : 0,
                completion_rate: typeof item.completion_rate === "number" ? item.completion_rate : 0,
            };
        });
};

const normalizeAnalyticsPayload = (value: unknown): ProductionAnalyticsData => {
    if (!value || typeof value !== "object") {
        return {
            average_turnaround_days: 0,
            qc_rejection_rate: 0,
            vendor_on_time_rate: 0,
            monthly_revenue: null,
            team_performance: [],
            job_status_distribution: [],
        };
    }

    const payload = value as Record<string, unknown>;

    return {
        average_turnaround_days:
            typeof payload.average_turnaround_days === "number" ? payload.average_turnaround_days : 0,
        qc_rejection_rate: typeof payload.qc_rejection_rate === "number" ? payload.qc_rejection_rate : 0,
        vendor_on_time_rate: typeof payload.vendor_on_time_rate === "number" ? payload.vendor_on_time_rate : 0,
        monthly_revenue: typeof payload.monthly_revenue === "number" ? payload.monthly_revenue : null,
        team_performance: normalizeTeamPerformance(payload.team_performance),
        job_status_distribution: normalizeStatusDistribution(payload.job_status_distribution),
    };
};

export const fetchProductionAnalyticsData = async (): Promise<ProductionAnalyticsData> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/production-analytics/`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch((): unknown => ({}));
        throw new ProductionAnalyticsApiError(parseApiErrorMessage(errorPayload), response.status);
    }

    const payload = await response.json();
    return normalizeAnalyticsPayload(payload);
};

const normalizeJobsList = (value: unknown): Job[] => {
    if (Array.isArray(value)) {
        return value as Job[];
    }

    if (!value || typeof value !== "object") {
        return [];
    }

    const payload = value as Partial<JobsResponse>;
    if (!Array.isArray(payload.results)) {
        return [];
    }

    return payload.results;
};

export const fetchRecentProductionJobs = async (limit: number): Promise<Job[]> => {
    const query = new URLSearchParams({
        ordering: "-created_at",
        page: "1",
        page_size: String(limit),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/?${query.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch((): unknown => ({}));
        throw new ProductionAnalyticsApiError(parseApiErrorMessage(errorPayload), response.status);
    }

    const payload = await response.json();
    return normalizeJobsList(payload).slice(0, limit);
};