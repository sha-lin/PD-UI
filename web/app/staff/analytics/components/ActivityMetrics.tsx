import { DashboardStats } from "../types";

interface ActivityMetricsProps {
    stats: DashboardStats;
}

export default function ActivityMetrics({ stats }: ActivityMetricsProps) {
    const metrics = [
        {
            label: "Total Clients",
            value: stats.total_clients ?? 0,
            trend: stats.new_clients_trend ?? 0,
            trendLabel: "new this month",
        },
        {
            label: "Active Leads",
            value: stats.active_leads ?? 0,
            trend: stats.new_leads_trend ?? 0,
            trendLabel: "new this month",
        },
        {
            label: "Pending Orders",
            value: stats.pending_orders ?? 0,
            trend: stats.new_orders_trend ?? 0,
            trendLabel: "new this month",
        },
        {
            label: "Active Jobs",
            value: stats.active_jobs ?? 0,
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => {
                    return (
                        <div key={metric.label} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{metric.label}</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metric.value.toLocaleString()}
                            </div>
                            {metric.trend !== undefined && (
                                <div className="text-xs text-gray-600 mt-2">
                                    <span className="font-semibold text-brand-green">
                                        +{metric.trend}
                                    </span>{" "}
                                    {metric.trendLabel}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
