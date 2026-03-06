"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactElement } from "react";
import VendorLayout from "@/components/vendor/vendor-layout";
import { fetchCurrentVendor, fetchVendorPerformanceScorecard } from "@/services/vendors";
import PerformanceGaugeChart from "@/features/vendors/components/PerformanceGaugeChart";
import MetricsComparisonChart from "@/features/vendors/components/MetricsComparisonChart";
import {
    Clock,
    AlertCircle,
    Timer,
    DollarSign,
    Award,
    FileCheck,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
}

function MetricCard({ label, value, unit, icon: Icon }: MetricCardProps): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                            {value}
                        </span>
                        {unit && <span className="text-lg text-gray-500">{unit}</span>}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                    <Icon className="w-6 h-6 text-gray-600" />
                </div>
            </div>
        </div>
    );
}

function SkeletonCard(): ReactElement {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
}

export default function VendorPerformancePage(): ReactElement {
    const { data: vendor, isLoading: isLoadingVendor, error: vendorError } = useQuery({
        queryKey: ["current-vendor"],
        queryFn: fetchCurrentVendor,
        staleTime: 10 * 60 * 1000,
    });

    const { data, isLoading: isLoadingPerformance, error } = useQuery({
        queryKey: ["vendor-performance", vendor?.id],
        queryFn: () => fetchVendorPerformanceScorecard(vendor!.id),
        enabled: !!vendor?.id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const isLoading = isLoadingVendor || isLoadingPerformance;

    const getGradeColor = (grade: string): string => {
        if (grade === "A") return "text-green-600 bg-green-50 border-green-200";
        if (grade === "B") return "text-blue-600 bg-blue-50 border-blue-200";
        if (grade === "C") return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getInsightIcon = (icon: string) => {
        if (icon === "check-circle") return CheckCircle2;
        if (icon === "alert-triangle") return AlertTriangle;
        if (icon === "x-circle") return XCircle;
        return AlertCircle;
    };

    const getInsightColor = (type: string): string => {
        if (type === "positive") return "border-l-green-500 bg-green-50";
        if (type === "warning") return "border-l-yellow-500 bg-yellow-50";
        if (type === "negative") return "border-l-red-500 bg-red-50";
        return "border-l-gray-500 bg-gray-50";
    };

    const getInsightTextColor = (type: string): string => {
        if (type === "positive") return "text-green-900";
        if (type === "warning") return "text-yellow-900";
        if (type === "negative") return "text-red-900";
        return "text-gray-900";
    };

    return (
        <VendorLayout>
            <header className="bg-white shadow">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-brand-black">Performance Scorecard</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your performance metrics and VPS rating
                    </p>
                </div>
            </header>

            <main className="p-8 space-y-6">
                {isLoading && (
                    <>
                        {/* Hero Skeleton */}
                        <div className="bg-gray-100 rounded-lg p-8 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                                </div>
                                <div className="text-right">
                                    <div className="h-16 w-24 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Skeleton */}
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        </div>

                        {/* Operational Metrics Skeleton */}
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        </div>
                    </>
                )}

                {(error || vendorError) && !isLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Unable to load performance data</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {vendorError
                                        ? (vendorError instanceof Error ? vendorError.message : "Unable to load vendor profile. Please contact support.")
                                        : (error instanceof Error ? error.message : "Unable to load performance data. Please try again later.")
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {data && (
                    <>
                        {/* Hero - Overall Score */}
                        <div className="bg-gradient-to-br from-brand-blue to-blue-700 rounded-lg p-8 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Award className="w-8 h-8" />
                                        <h2 className="text-2xl font-bold">Vendor Performance Score (VPS)</h2>
                                    </div>
                                    <p className="text-blue-100 text-sm">
                                        Overall rating across quality, delivery, and reliability metrics
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-6xl font-bold">{data.overall_score}</div>
                                    <div className={`inline-block px-4 py-2 rounded-lg border-2 mt-2 ${getGradeColor(data.vps_grade)}`}>
                                        <span className="text-2xl font-bold">Grade {data.vps_grade}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status badges */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                    <FileCheck className="w-4 h-4" />
                                    <span className="text-sm">{data.tax_status}</span>
                                </div>
                                {data.certifications.length > 0 && (
                                    <div className="flex items-center gap-2 bg-brand-yellow text-brand-blue px-3 py-1.5 rounded-full">
                                        <Award className="w-4 h-4" />
                                        <span className="text-sm font-semibold">{data.certifications[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Overview Chart */}
                        <MetricsComparisonChart
                            onTimeRate={data.on_time_rate}
                            qualityScore={data.quality_score}
                            acceptanceRate={data.acceptance_rate}
                            defectRate={data.defect_rate}
                        />

                        {/* Key Performance Metrics - Gauges */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Gauges</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <PerformanceGaugeChart
                                    label="On-Time Delivery"
                                    value={data.on_time_rate}
                                    target={85}
                                    unit="%"
                                />
                                <PerformanceGaugeChart
                                    label="Quality Score"
                                    value={data.quality_score}
                                    target={95}
                                    unit="%"
                                />
                                <PerformanceGaugeChart
                                    label="Acceptance Rate"
                                    value={data.acceptance_rate}
                                    target={80}
                                    unit="%"
                                />
                                <PerformanceGaugeChart
                                    label="Defect Rate"
                                    value={data.defect_rate}
                                    target={5}
                                    unit="%"
                                    inverse={true}
                                />
                            </div>
                        </section>

                        {/* Operational Metrics - Simple Cards */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Operational Metrics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    label="Average Turnaround"
                                    value={data.avg_turnaround}
                                    unit=" days"
                                    icon={Clock}
                                />
                                <MetricCard
                                    label="Avg Response Time"
                                    value={data.response_time.toFixed(1)}
                                    unit=" hrs"
                                    icon={Timer}
                                />
                                <MetricCard
                                    label="Cost per Job"
                                    value={`KES ${data.cost_per_job.toLocaleString()}`}
                                    icon={DollarSign}
                                />
                                <MetricCard
                                    label="Decline Rate"
                                    value={data.decline_rate}
                                    unit="%"
                                    icon={TrendingDown}
                                />
                            </div>
                        </section>

                        {/* Alerts Section */}
                        {(data?.ghosting_incidents ?? 0) > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-orange-900">Ghosting Incidents</h3>
                                        <p className="text-sm text-orange-700 mt-1">
                                            {data.ghosting_incidents} PO(s) accepted but no activity for &gt;48 hours.
                                            Please update progress regularly to maintain good standing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Performance Insights */}
                        {(data?.insights?.length ?? 0) > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h2>
                                <div className="space-y-3">
                                    {data.insights.map((insight, index) => {
                                        const InsightIcon = getInsightIcon(insight.icon);
                                        return (
                                            <div
                                                key={index}
                                                className={`border-l-4 rounded-lg p-4 ${getInsightColor(insight.type)}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <InsightIcon className={`w-5 h-5 mt-0.5 ${getInsightTextColor(insight.type)}`} />
                                                    <div className="flex-1">
                                                        <h3 className={`font-semibold ${getInsightTextColor(insight.type)}`}>
                                                            {insight.title}
                                                        </h3>
                                                        <p className={`text-sm mt-1 ${getInsightTextColor(insight.type)}`}>
                                                            {insight.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Info Footer */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Performance metrics are calculated based on the last 90 days of activity.
                                Maintain high standards to improve your VPS grade and receive priority job assignments.
                            </p>
                        </div>
                    </>
                )}
            </main>
        </VendorLayout>
    );
}
