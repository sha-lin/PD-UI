"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import DashboardAlerts from "@/features/dashboard/components/DashboardAlerts";
import DashboardCharts from "@/features/dashboard/components/DashboardCharts";
import DashboardKpiGrid from "@/features/dashboard/components/DashboardKpiGrid";
import JobsStatusChart from "@/features/dashboard/components/JobsStatusChart";
import QuotesStatusChart from "@/features/dashboard/components/QuotesStatusChart";
import {
    fetchDashboardAlerts,
    fetchDashboardAnalytics,
    fetchDashboardOverview,
} from "@/services/dashboard";
import type {
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

    const isLoading = overviewQuery.isLoading || analyticsQuery.isLoading || alertsQuery.isLoading;
    const hasError = overviewQuery.isError || analyticsQuery.isError || alertsQuery.isError;

    const revenueSeries = useMemo((): RevenueChartPoint[] => {
        const trend = analyticsQuery.data?.sales_performance_trend ?? [];
        return trend.map((item): RevenueChartPoint => ({
            label: item.month,
            revenue: Number(item.revenue || 0),
            orders: Number(item.orders || 0),
        }));
    }, [analyticsQuery.data?.sales_performance_trend]);

    const topAlerts = alertsQuery.data?.results ?? [];

    return (
        <AdminLayout>
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold text-brand-black">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Monitor your business performance and key metrics</p>
                </div>
            </header>

            <main className="p-8 space-y-6 bg-gray-50">
                {isLoading ? (
                    <div className="space-y-6 animate-pulse">
                        {/* KPI cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-4 w-28 rounded bg-gray-200" />
                                        <div className="h-10 w-10 rounded-lg bg-gray-100" />
                                    </div>
                                    <div className="h-8 w-36 rounded bg-gray-200 mb-2" />
                                    <div className="h-3 w-24 rounded bg-gray-100" />
                                </div>
                            ))}
                        </div>

                        {/* Revenue chart */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="h-5 w-40 rounded bg-gray-200 mb-2" />
                            <div className="h-3 w-56 rounded bg-gray-100 mb-6" />
                            <div className="h-[340px] w-full rounded-lg bg-gray-100" />
                        </div>

                        {/* Status charts */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="h-5 w-32 rounded bg-gray-200 mb-2" />
                                    <div className="h-3 w-44 rounded bg-gray-100 mb-6" />
                                    <div className="h-[260px] w-full rounded-lg bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {hasError ? (
                    <div className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-4">
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
                    <>
                        <DashboardKpiGrid overview={overviewQuery.data} analytics={analyticsQuery.data} />

                        <DashboardCharts revenueSeries={revenueSeries} />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <JobsStatusChart overview={overviewQuery.data} />
                            <QuotesStatusChart overview={overviewQuery.data} />
                        </div>

                        {topAlerts.length > 0 ? <DashboardAlerts alerts={topAlerts} /> : null}
                    </>
                ) : null}
            </main>
        </AdminLayout>
    );
}
