"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import DashboardAlerts from "@/features/dashboard/components/DashboardAlerts";
import DashboardCharts from "@/features/dashboard/components/DashboardCharts";
import DashboardKpiGrid from "@/features/dashboard/components/DashboardKpiGrid";
import DashboardQuickActions from "@/features/dashboard/components/DashboardQuickActions";
import DashboardRecentActivity from "@/features/dashboard/components/DashboardRecentActivity";
import {
    fetchDashboardActivity,
    fetchDashboardAlerts,
    fetchDashboardAnalytics,
    fetchDashboardOverview,
} from "@/services/dashboard";
import type {
    DashboardActivityResponse,
    DashboardAlertsResponse,
    DashboardAnalytics,
    DashboardOverview,
    RevenueChartPoint,
} from "@/types/dashboard";

export default function DashboardPage(): ReactElement {
    const overviewQuery = useQuery({
        queryKey: ["dashboard", "overview"],
        queryFn: (): Promise<DashboardOverview> => fetchDashboardOverview(),
    });

    const analyticsQuery = useQuery({
        queryKey: ["dashboard", "analytics"],
        queryFn: (): Promise<DashboardAnalytics> => fetchDashboardAnalytics(),
    });

    const alertsQuery = useQuery({
        queryKey: ["dashboard", "alerts"],
        queryFn: (): Promise<DashboardAlertsResponse> => fetchDashboardAlerts(),
    });

    const activityQuery = useQuery({
        queryKey: ["dashboard", "activity"],
        queryFn: (): Promise<DashboardActivityResponse> => fetchDashboardActivity(),
    });

    const isLoading = overviewQuery.isLoading || analyticsQuery.isLoading || alertsQuery.isLoading || activityQuery.isLoading;
    const hasError = overviewQuery.isError || analyticsQuery.isError || alertsQuery.isError || activityQuery.isError;

    const revenueSeries = useMemo((): RevenueChartPoint[] => {
        const trend = analyticsQuery.data?.sales_performance_trend ?? [];
        return trend.map((item): RevenueChartPoint => ({
            label: item.month,
            revenue: Number(item.revenue || 0),
            orders: Number(item.orders || 0),
        }));
    }, [analyticsQuery.data?.sales_performance_trend]);

    const topAlerts = alertsQuery.data?.results ?? [];
    const recentActivities = activityQuery.data?.results ?? [];

    return (
        <AdminLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
                </div>
            </header>

            <main className="p-8 space-y-5">
                {isLoading ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Loader2Icon className="h-5 w-5 animate-spin" />
                            <p className="text-sm font-medium">Loading dashboard data...</p>
                        </div>
                    </div>
                ) : null}

                {hasError ? (
                    <div className="rounded-lg border border-brand-red/30 bg-brand-red/5 p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircleIcon className="mt-0.5 h-4 w-4 text-brand-red" />
                            <div>
                                <p className="text-sm font-semibold text-brand-red">Unable to load some dashboard sections.</p>
                                <p className="mt-1 text-sm text-gray-700">
                                    Refresh the page to retry. If the issue persists, check API availability.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {overviewQuery.data && analyticsQuery.data ? (
                    <DashboardKpiGrid overview={overviewQuery.data} analytics={analyticsQuery.data} />
                ) : null}

                <DashboardQuickActions />

                <DashboardCharts revenueSeries={revenueSeries} />

                <DashboardAlerts alerts={topAlerts} />

                <DashboardRecentActivity activities={recentActivities} />
            </main>
        </AdminLayout>
    );
}
