"use client";

import type { ReactElement } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { DashboardOverview } from "@/types/dashboard";

interface JobsStatusChartProps {
    overview: DashboardOverview;
}

const STATUS_COLORS: Record<string, string> = {
    "In Progress": "#093756",
    Pending: "#F6B619",
    "On Hold": "#F15A29",
    Completed: "#009444",
};

export default function JobsStatusChart({ overview }: JobsStatusChartProps): ReactElement {
    const chartData = [
        { name: "In Progress", value: overview.jobs.in_progress, color: STATUS_COLORS["In Progress"] },
        { name: "Pending", value: overview.jobs.pending, color: STATUS_COLORS["Pending"] },
        { name: "On Hold", value: overview.jobs.on_hold, color: STATUS_COLORS["On Hold"] },
        { name: "Completed", value: overview.jobs.completed, color: STATUS_COLORS["Completed"] },
    ].filter((item) => item.value > 0);

    const totalJobs = overview.jobs.total;

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Jobs Status Distribution</h2>
                    <p className="mt-1 text-sm text-gray-600">{totalJobs} total jobs</p>
                </div>
            </div>
            <div className="mt-6 h-[300px]">
                {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <p className="text-sm">No jobs to display</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={90}
                                innerRadius={50}
                                fill="#8884d8"
                                dataKey="value"
                                strokeWidth={2}
                                stroke="#fff"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined): [string, string] => [
                                    `${value ?? 0} jobs`,
                                    "Count",
                                ]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value: string): string => value}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </article>
    );
}
