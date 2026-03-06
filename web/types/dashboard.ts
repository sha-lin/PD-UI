export interface DashboardOverview {
    leads: {
        total: number;
        new: number;
        converted: number;
    };
    clients: {
        total: number;
        b2b: number;
        b2c: number;
    };
    quotes: {
        total: number;
        draft: number;
        sent_to_customer: number;
        approved: number;
        lost: number;
        ecommerce: number;
    };
    jobs: {
        total: number;
        pending: number;
        in_progress: number;
        on_hold: number;
        completed: number;
    };
    lpos: {
        total: number;
        pending: number;
        approved: number;
        completed: number;
    };
}

export interface SalesPerformancePoint {
    month: string;
    revenue: number;
    orders: number;
}

export interface CategoryRevenuePoint {
    category: string;
    revenue: number;
    orders: number;
}

export interface DashboardStats {
    total_clients: number;
    active_leads: number;
    pending_orders: number;
    active_jobs: number;
    total_products: number;
    total_revenue: number;
    new_clients_trend: number;
    new_leads_trend: number;
    new_orders_trend: number;
    revenue_trend: number;
}

export interface DashboardAnalytics {
    dashboard_stats: DashboardStats;
    sales_performance_trend: SalesPerformancePoint[];
    revenue_by_category: Array<Record<string, unknown>>;
}

export interface DashboardAlert {
    id: number;
    alert_type: string;
    severity: string;
    title: string;
    message: string;
    created_at: string;
    is_active: boolean;
    is_dismissed: boolean;
}

export interface DashboardAlertsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: DashboardAlert[];
}

export interface DashboardActivity {
    id: number;
    activity_type: string;
    title: string;
    description: string;
    client: number | null;
    created_by: number | null;
    created_at: string;
}

export interface DashboardActivityResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: DashboardActivity[];
}

export interface AccountManagerKPIs {
    my_revenue_this_month: number;
    my_win_rate: number;
    active_jobs_count: number;
    new_clients_this_month: number;
}

export interface LeadFunnel {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
}

export interface QuoteStatusDistribution {
    draft: number;
    quoted: number;
    approved: number;
    lost: number;
}

export interface RevenueTrendPoint {
    month: string;
    revenue: number;
}

export interface ClientGrowthPoint {
    month: string;
    b2b: number;
    b2c: number;
}

export interface TopProduct {
    name: string;
    revenue: number;
    count: number;
}

export interface JobsStatusDistribution {
    pending: number;
    in_progress: number;
    on_hold: number;
    completed: number;
}

export interface RecentQuote {
    id: number;
    quote_id: string;
    client_name: string | null;
    lead_name: string | null;
    product_name: string;
    quantity: number;
    total_amount: number;
    status: string;
    created_at: string;
}

export interface UpcomingAction {
    type: "quote" | "job" | "lead";
    id: number;
    title: string;
    description: string;
    client_name: string;
    due_date: string;
    priority: "low" | "medium" | "high";
}

export interface AccountManagerDashboard {
    kpis: AccountManagerKPIs;
    lead_funnel: LeadFunnel;
    quote_status: QuoteStatusDistribution;
    revenue_trend: RevenueTrendPoint[];
    client_growth: ClientGrowthPoint[];
    top_products: TopProduct[];
    jobs_status: JobsStatusDistribution;
    recent_quotes: RecentQuote[];
    upcoming_actions: UpcomingAction[];
}

export interface RevenueChartPoint {
    label: string;
    revenue: number;
    orders: number;
}

export interface CategoryChartPoint {
    name: string;
    value: number;
}

export interface JobsChartPoint {
    status: string;
    count: number;
}
