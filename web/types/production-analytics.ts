export interface TeamPerformanceItem {
    user_id: number;
    user_name: string;
    total_jobs: number;
    completed_jobs: number;
    completion_rate: number;
}

export interface JobStatusDistributionItem {
    status: string;
    count: number;
}

export interface ProductionAnalyticsData {
    average_turnaround_days: number;
    qc_rejection_rate: number;
    vendor_on_time_rate: number;
    monthly_revenue: number | null;
    team_performance: TeamPerformanceItem[];
    job_status_distribution: JobStatusDistributionItem[];
}