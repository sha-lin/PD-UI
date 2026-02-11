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

export interface SalesPerformanceTrendItem {
    month: string;
    revenue: number;
    orders: number;
}

export interface TopProduct {
    product_name: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
}

export interface ConversionMetrics {
    lead_to_client: number;
    quote_to_order: number;
    total_leads: number;
    converted_clients: number;
}

export interface RevenueByCategory {
    category: string;
    revenue: number;
    percentage: number;
}

export interface ProfitMargins {
    total_revenue: number;
    total_cost: number;
    overall_margin: number;
    gross_profit: number;
}

export interface TimeInsights {
    peak_order_day: string;
    peak_order_hour: number;
    average_order_processing_days: number;
    busiest_month: string;
}

export interface OutstandingReceivables {
    total_receivables: number;
    overdue_amount: number;
    overdue_percentage: number;
    outstanding_count: number;
}

export interface CollectionRate {
    collection_rate: number;
    collected_amount: number;
    total_invoiced: number;
}

export interface SalesRepresentative {
    name: string;
    deals_closed: number;
    win_rate: number;
    revenue: number;
    avg_deal_size: number;
}

export interface StaffPerformance {
    sales_leaderboard: SalesRepresentative[];
    total_reps: number;
}

export interface AnalyticsData {
    dashboard_stats: DashboardStats;
    sales_performance_trend: SalesPerformanceTrendItem[];
    top_products: TopProduct[];
    conversion_metrics: ConversionMetrics;
    average_order_value: number;
    revenue_by_category: RevenueByCategory[];
    profit_margins: ProfitMargins;
    time_insights: TimeInsights;
    receivables: OutstandingReceivables;
    collection_rate: CollectionRate;
    staff_performance: StaffPerformance;
}
