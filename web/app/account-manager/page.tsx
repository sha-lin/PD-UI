"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import DashboardKPICards from "@/features/dashboard/components/DashboardKPICards";
import RevenueTrendChart from "@/features/dashboard/components/RevenueTrendChart";
import ClientGrowthChart from "@/features/dashboard/components/ClientGrowthChart";
import RecentQuotesTable from "@/features/dashboard/components/RecentQuotesTable";
import { fetchAccountManagerDashboard } from "@/services/dashboard";

export default function AccountManagerDashboardPage(): ReactElement {
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard", "account-manager"],
        queryFn: fetchAccountManagerDashboard,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });

    return (
        <AccountManagerLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-black">My Dashboard</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Personal performance metrics and analytics
                        </p>
                    </div>
                    <a
                        href="/account-manager/quotes/create"
                        className="rounded-md bg-brand-blue text-white px-4 py-2 text-sm font-semibold hover:bg-brand-blue/90"
                    >
                        Create Quote
                    </a>
                </div>
            </header>

            <main className="p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">
                            Failed to load dashboard data. Please refresh the page.
                        </p>
                    </div>
                )}

                <DashboardKPICards
                    kpis={data?.kpis || {
                        my_revenue_this_month: 0,
                        my_quotes_this_month: 0,
                        active_jobs_count: 0,
                        new_clients_this_month: 0,
                    }}
                    isLoading={isLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RevenueTrendChart
                        data={data?.revenue_trend || []}
                        isLoading={isLoading}
                    />
                    <ClientGrowthChart
                        data={data?.client_growth || []}
                        isLoading={isLoading}
                    />
                </div>

                <RecentQuotesTable
                    quotes={data?.recent_quotes || []}
                    isLoading={isLoading}
                />
            </main>
        </AccountManagerLayout>
    );
}
