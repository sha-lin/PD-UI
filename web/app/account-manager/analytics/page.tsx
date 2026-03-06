"use client";

import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, TrendingUpIcon, UsersIcon, FileTextIcon, TargetIcon } from "lucide-react";
import AccountManagerLayout from "@/components/account-manager/account-manager-layout";
import JobStatusDonutChart from "@/features/analytics/components/JobStatusDonutChart";
import QuoteBreakdownBarChart from "@/features/analytics/components/QuoteBreakdownBarChart";
import { fetchAccountManagerPerformance, fetchJobCompletionStats } from "@/services/analytics";

export default function AnalyticsPage(): ReactElement {
    const performanceQuery = useQuery({
        queryKey: ["am-performance"],
        queryFn: fetchAccountManagerPerformance,
    });

    const completionQuery = useQuery({
        queryKey: ["job-completion"],
        queryFn: fetchJobCompletionStats,
    });

    const isLoading = performanceQuery.isLoading || completionQuery.isLoading;
    const hasError = performanceQuery.error || completionQuery.error;
    const performance = performanceQuery.data;

    return (
        <AccountManagerLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="mt-2 text-sm text-gray-600">Your performance metrics and insights</p>
                </div>
            </header>

            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    {hasError && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-5 w-5 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load analytics</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch analytics data. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && !performance ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
                                <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {performance && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Quote Conversion
                                            </p>
                                            <FileTextIcon className="h-5 w-5 text-brand-blue" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {performance.quotes.conversion_rate_percent.toFixed(1)}%
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {performance.quotes.approved} of {performance.quotes.total} approved
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Total Revenue
                                            </p>
                                            <TrendingUpIcon className="h-5 w-5 text-brand-blue" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            KES {performance.quotes.total_revenue.toLocaleString()}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            KES {performance.quotes.average_quote_value.toLocaleString()} avg per quote
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Lead Conversion
                                            </p>
                                            <TargetIcon className="h-5 w-5 text-brand-blue" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {performance.leads.conversion_rate_percent.toFixed(1)}%
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {performance.leads.converted} of {performance.leads.total} converted
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                Active Clients
                                            </p>
                                            <UsersIcon className="h-5 w-5 text-brand-blue" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{performance.clients.managed}</p>
                                        <p className="mt-2 text-xs text-gray-500">Under your management</p>
                                    </div>
                                </div>
                            )}

                            {performance && completionQuery.data && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <JobStatusDonutChart stats={completionQuery.data} />
                                    <QuoteBreakdownBarChart performance={performance} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </AccountManagerLayout>
    );
}
