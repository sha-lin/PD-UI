"use client";

import type { ReactElement } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { QuoteStatusDistribution } from "@/types/dashboard";

interface QuotePerformanceChartProps {
    data: QuoteStatusDistribution;
    isLoading?: boolean;
}

const STATUS_COLORS = {
    approved: "#009444",
    quoted: "#F6B619",
    draft: "#6b7280",
    lost: "#ED1C24",
};

const STATUS_LABELS = {
    approved: "Approved",
    quoted: "Quoted",
    draft: "Draft",
    lost: "Lost",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; percent: number }> }): ReactElement | null => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0];
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-xs font-medium text-gray-900">{data.name}</p>
            <p className="text-sm font-bold text-brand-blue mt-1">
                {data.value} quotes ({(data.percent * 100).toFixed(1)}%)
            </p>
        </div>
    );
};

export default function QuotePerformanceChart({ data, isLoading }: QuotePerformanceChartProps): ReactElement {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quote Performance</h3>
                    <p className="text-xs text-gray-500 mt-1">Distribution by status</p>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-sm text-gray-500">Loading chart data...</div>
                </div>
            </div>
        );
    }

    const chartData = [
        { name: STATUS_LABELS.approved, value: data.approved, color: STATUS_COLORS.approved },
        { name: STATUS_LABELS.quoted, value: data.quoted, color: STATUS_COLORS.quoted },
        { name: STATUS_LABELS.draft, value: data.draft, color: STATUS_COLORS.draft },
        { name: STATUS_LABELS.lost, value: data.lost, color: STATUS_COLORS.lost },
    ].filter(item => item.value > 0);

    const total = data.approved + data.quoted + data.draft + data.lost;
    const winRate = total > 0 ? ((data.approved / total) * 100).toFixed(1) : "0.0";

    if (total === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quote Performance</h3>
                    <p className="text-xs text-gray-500 mt-1">Distribution by status</p>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No quote data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quote Performance</h3>
                <p className="text-xs text-gray-500 mt-1">Distribution by status</p>
            </div>
            <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="circle"
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-2xl font-bold text-brand-blue">{winRate}%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                </div>
            </div>
        </div>
    );
}
