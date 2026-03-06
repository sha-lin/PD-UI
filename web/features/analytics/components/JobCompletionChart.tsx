import type { ReactElement } from "react";
import type { JobCompletionStats } from "@/types/analytics";
import { CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react";

interface JobCompletionChartProps {
    stats: JobCompletionStats;
}

export default function JobCompletionChart({ stats }: JobCompletionChartProps): ReactElement {
    const total = stats.total || 1;
    const completedPercent = (stats.completed / total) * 100;
    const inProgressPercent = (stats.in_progress / total) * 100;
    const pendingPercent = (stats.pending / total) * 100;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Job Status Distribution</h2>
                <p className="mt-1 text-sm text-gray-600">Overview of current jobs by status</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                    <p className="mt-2 text-sm font-medium text-gray-600">Total Jobs</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-brand-green/10 p-2">
                            <CheckCircleIcon className="h-5 w-5 text-brand-green" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-brand-green">{completedPercent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full bg-brand-green transition-all duration-300"
                            style={{ width: `${completedPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-brand-blue/10 p-2">
                            <ClockIcon className="h-5 w-5 text-brand-blue" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-brand-blue">{inProgressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full bg-brand-blue transition-all duration-300"
                            style={{ width: `${inProgressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-brand-yellow/10 p-2">
                            <AlertCircleIcon className="h-5 w-5 text-brand-yellow" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-brand-yellow">{pendingPercent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full bg-brand-yellow transition-all duration-300"
                            style={{ width: `${pendingPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {stats.completion_rate > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Overall Completion Rate</span>
                        <span className="text-2xl font-bold text-brand-green">{stats.completion_rate.toFixed(1)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
}
