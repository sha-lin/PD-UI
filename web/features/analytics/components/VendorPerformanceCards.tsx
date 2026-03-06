import type { ReactElement } from "react";
import type { JobCompletionStats } from "@/types/analytics";
import { CheckCircleIcon, ClockIcon, StarIcon, TimerIcon } from "lucide-react";

interface VendorPerformanceCardsProps {
    completionStats: JobCompletionStats;
    averageQuality: number;
    averageTurnaround: number;
    onTimeRate: number;
}

export default function VendorPerformanceCards({
    completionStats,
    averageQuality,
    averageTurnaround,
    onTimeRate,
}: VendorPerformanceCardsProps): ReactElement {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Vendor Performance Overview</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <div className="rounded-lg bg-green-50 p-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">{completionStats.completion_rate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">
                        {completionStats.completed} of {completionStats.total} jobs completed
                    </p>
                </div>

                <div className="rounded-lg border border-brand-blue/20 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                        <div className="rounded-lg bg-brand-blue/10 p-2">
                            <ClockIcon className="h-5 w-5 text-brand-blue" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">{onTimeRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Average across all vendors</p>
                </div>

                <div className="rounded-lg border border-brand-yellow/40 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Quality Score</p>
                        <div className="rounded-lg bg-brand-yellow/20 p-2">
                            <StarIcon className="h-5 w-5 text-brand-yellow" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">{averageQuality.toFixed(1)}/5.0</p>
                    <p className="text-xs text-gray-500">Average quality rating</p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Avg Turnaround</p>
                        <div className="rounded-lg bg-purple-50 p-2">
                            <TimerIcon className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">{averageTurnaround.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">days average completion time</p>
                </div>
            </div>
        </div>
    );
}
