"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircleIcon,
    BarChart3Icon,
    CheckCircle2Icon,
    Clock3Icon,
    RefreshCcwIcon,
    ShieldCheckIcon,
    Users2Icon,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    fetchProductionAnalyticsData,
    fetchRecentProductionJobs,
} from "@/lib/api/production-analytics";
import type { Job } from "@/types/jobs";
import type {
    JobStatusDistributionItem,
    ProductionAnalyticsData,
    TeamPerformanceItem,
} from "@/types/production-analytics";

interface StatusChartItem {
    name: string;
    value: number;
    color: string;
}

const STATUS_COLORS: string[] = [
    "#093756",
    "#F6B619",
    "#009444",
    "#F15A29",
    "#662D91",
    "#ED1C24",
];

const toTitleCase = (value: string): string => {
    return value
        .replaceAll("_", " ")
        .split(" ")
        .filter((part: string): boolean => part.length > 0)
        .map((part: string): string => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

const formatCurrency = (value: number | null): string => {
    if (value === null) {
        return "—";
    }

    return `KES ${value.toLocaleString()}`;
};

const formatDate = (value: string | null): string => {
    if (!value) {
        return "Not set";
    }

    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
        return "Not set";
    }

    return dateValue.toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getStatusBadgeClass = (status: string): string => {
    if (status === "completed") {
        return "bg-brand-green/10 text-brand-green border-brand-green/20";
    }

    if (status === "in_progress") {
        return "bg-brand-blue/10 text-brand-blue border-brand-blue/20";
    }

    if (status === "on_hold") {
        return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
    }

    return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
};

const buildStatusChartData = (items: JobStatusDistributionItem[]): StatusChartItem[] => {
    return items.map((item: JobStatusDistributionItem, index: number): StatusChartItem => {
        return {
            name: toTitleCase(item.status),
            value: item.count,
            color: STATUS_COLORS[index % STATUS_COLORS.length],
        };
    });
};

const getAverageCompletionRate = (items: TeamPerformanceItem[]): number => {
    if (items.length === 0) {
        return 0;
    }

    const totalCompletionRate = items.reduce((sum: number, item: TeamPerformanceItem): number => {
        return sum + item.completion_rate;
    }, 0);

    return totalCompletionRate / items.length;
};

export default function ProductionAnalyticsWorkspace(): ReactElement {
    const analyticsQuery = useQuery({
        queryKey: ["production-analytics"],
        queryFn: fetchProductionAnalyticsData,
    });

    const recentJobsQuery = useQuery({
        queryKey: ["production-analytics-jobs"],
        queryFn: (): Promise<Job[]> => fetchRecentProductionJobs(6),
    });

    const analytics: ProductionAnalyticsData | undefined = analyticsQuery.data;
    const statusChartData = useMemo((): StatusChartItem[] => {
        return buildStatusChartData(analytics?.job_status_distribution ?? []);
    }, [analytics?.job_status_distribution]);

    const averageTeamCompletion = useMemo((): number => {
        return getAverageCompletionRate(analytics?.team_performance ?? []);
    }, [analytics?.team_performance]);

    const totalTrackedJobs = useMemo((): number => {
        return (analytics?.job_status_distribution ?? []).reduce((sum: number, item: JobStatusDistributionItem): number => {
            return sum + item.count;
        }, 0);
    }, [analytics?.job_status_distribution]);

    if (analyticsQuery.isLoading) {
        return (
            <main className="bg-gray-50 min-h-screen">
                <header className="border-b border-gray-200 bg-white">
                    <div className="px-8 py-4">
                        <div className="h-3 w-52 animate-pulse rounded bg-gray-200" />
                        <div className="mt-4 h-8 w-72 animate-pulse rounded bg-gray-200" />
                        <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-200" />
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, index: number): ReactElement => (
                            <div key={`metric-skeleton-${index}`} className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                <div className="mt-4 h-8 w-24 animate-pulse rounded bg-gray-200" />
                                <div className="mt-4 h-3 w-40 animate-pulse rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="h-96 rounded-xl border border-gray-200 bg-white" />
                        <div className="h-96 rounded-xl border border-gray-200 bg-white" />
                    </div>
                </div>
            </main>
        );
    }

    if (analyticsQuery.isError || !analytics) {
        return (
            <main className="bg-gray-50 min-h-screen">
                <header className="border-b border-gray-200 bg-white">
                    <div className="px-8 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <a href="/staff/production-team" className="hover:text-brand-blue">Production Team</a>
                            <span>/</span>
                            <span className="text-gray-900">Analytics</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Production Analytics</h1>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-8 py-8">
                    <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircleIcon className="h-6 w-6 text-brand-red mt-0.5" />
                            <div>
                                <h2 className="text-lg font-semibold text-brand-red">Unable to load production analytics</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    The analytics service did not return data. Try refreshing.
                                </p>
                                <button
                                    type="button"
                                    onClick={(): void => {
                                        void analyticsQuery.refetch();
                                        void recentJobsQuery.refetch();
                                    }}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                                >
                                    <RefreshCcwIcon className="h-4 w-4" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <a href="/staff/production-team" className="hover:text-brand-blue">Production Team</a>
                                <span>/</span>
                                <span className="text-gray-900">Analytics</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Production Analytics</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Operations-focused visibility for turnaround, quality, and team execution.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={(): void => {
                                void analyticsQuery.refetch();
                                void recentJobsQuery.refetch();
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-blue hover:text-brand-blue"
                        >
                            <RefreshCcwIcon className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Avg Turnaround</p>
                            <Clock3Icon className="h-4 w-4 text-brand-blue" />
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">{analytics.average_turnaround_days.toFixed(1)}d</p>
                        <p className="mt-2 text-sm text-gray-600">Average time to complete a job.</p>
                    </article>

                    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">QC Rejection</p>
                            <ShieldCheckIcon className="h-4 w-4 text-brand-red" />
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">{formatPercentage(analytics.qc_rejection_rate)}</p>
                        <p className="mt-2 text-sm text-gray-600">Share of inspections rejected in the latest window.</p>
                    </article>

                    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vendor On-Time</p>
                            <CheckCircle2Icon className="h-4 w-4 text-brand-green" />
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">{formatPercentage(analytics.vendor_on_time_rate)}</p>
                        <p className="mt-2 text-sm text-gray-600">Completed vendor stages delivered on schedule.</p>
                    </article>

                    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Monthly Revenue</p>
                            <BarChart3Icon className="h-4 w-4 text-brand-purple" />
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">{formatCurrency(analytics.monthly_revenue)}</p>
                        <p className="mt-2 text-sm text-gray-600">Current production revenue snapshot.</p>
                    </article>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Team Completion Performance</h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                                <Users2Icon className="h-3.5 w-3.5" />
                                {analytics.team_performance.length} Members
                            </span>
                        </div>

                        {analytics.team_performance.length === 0 ? (
                            <div className="h-72 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                                Team performance data is not available yet.
                            </div>
                        ) : (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.team_performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="user_name" stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 12 }} />
                                        <YAxis
                                            domain={[0, 100]}
                                            stroke="#9ca3af"
                                            tick={{ fill: "#6b7280", fontSize: 12 }}
                                            tickFormatter={(value: number): string => `${value}%`}
                                        />
                                        <Tooltip
                                            formatter={(value: number): [string, string] => [`${value.toFixed(1)}%`, "Completion"]}
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "1px solid #e5e7eb",
                                            }}
                                        />
                                        <Bar dataKey="completion_rate" fill="#093756" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </article>

                    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Job Status Distribution</h2>
                        <p className="mt-1 text-sm text-gray-600">{totalTrackedJobs.toLocaleString()} tracked jobs</p>

                        {statusChartData.length === 0 ? (
                            <div className="mt-6 h-72 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                                Status data is not available yet.
                            </div>
                        ) : (
                            <div className="mt-4 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={2}
                                        >
                                            {statusChartData.map((item: StatusChartItem): ReactElement => (
                                                <Cell key={item.name} fill={item.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, name: string): [string, string] => [
                                                value.toLocaleString(),
                                                name,
                                            ]}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </article>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                            <a href="/staff/jobs" className="text-sm font-medium text-brand-blue hover:underline">
                                View all jobs
                            </a>
                        </div>

                        {recentJobsQuery.isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, index: number): ReactElement => (
                                    <div key={`job-skeleton-${index}`} className="h-12 animate-pulse rounded bg-gray-100" />
                                ))}
                            </div>
                        ) : null}

                        {recentJobsQuery.isError ? (
                            <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-4 text-sm text-brand-red">
                                Unable to load recent jobs.
                            </div>
                        ) : null}

                        {!recentJobsQuery.isLoading && !recentJobsQuery.isError ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Job</th>
                                            <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                                            <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                                            <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due</th>
                                            <th className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(recentJobsQuery.data ?? []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                                                    No recent production jobs found.
                                                </td>
                                            </tr>
                                        ) : (
                                            (recentJobsQuery.data ?? []).map((job: Job): ReactElement => (
                                                <tr key={job.id} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-3 text-sm font-semibold text-gray-900">{job.job_number || `#${job.id}`}</td>
                                                    <td className="py-3 text-sm text-gray-700">{job.client?.name || "Unassigned"}</td>
                                                    <td className="py-3 text-sm text-gray-700">{job.product || "Not set"}</td>
                                                    <td className="py-3 text-sm text-gray-700">{formatDate(job.expected_completion)}</td>
                                                    <td className="py-3 text-right">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(job.status)}`}
                                                        >
                                                            {toTitleCase(job.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}
                    </article>

                    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Summary</h2>

                        <dl className="mt-5 space-y-4">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Team Completion Average</dt>
                                <dd className="mt-2 text-2xl font-bold text-gray-900">{formatPercentage(averageTeamCompletion)}</dd>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tracked Job Status Records</dt>
                                <dd className="mt-2 text-2xl font-bold text-gray-900">{totalTrackedJobs.toLocaleString()}</dd>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Top Team Member</dt>
                                <dd className="mt-2 text-lg font-semibold text-gray-900">
                                    {analytics.team_performance.length > 0
                                        ? analytics.team_performance
                                            .slice()
                                            .sort((first: TeamPerformanceItem, second: TeamPerformanceItem): number => {
                                                return second.completion_rate - first.completion_rate;
                                            })[0].user_name
                                        : "Not available"}
                                </dd>
                            </div>
                        </dl>
                    </article>
                </section>
            </div>
        </main>
    );
}