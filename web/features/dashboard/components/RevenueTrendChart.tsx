"use client";

import type { ReactElement } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { RevenueTrendPoint } from "@/types/dashboard";

interface RevenueTrendChartProps {
    data: RevenueTrendPoint[];
    isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: RevenueTrendPoint }> }): ReactElement | null => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-xs font-medium text-gray-900">{data.month}</p>
            <p className="text-sm font-bold text-brand-blue mt-1">
                KES {data.revenue.toLocaleString()}
            </p>
        </div>
    );
};

export default function RevenueTrendChart({ data, isLoading }: RevenueTrendChartProps): ReactElement {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Revenue Trend</h3>
                        <p className="text-xs text-gray-500 mt-1">Last 6 months performance</p>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-sm text-gray-500">Loading chart data...</div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Revenue Trend</h3>
                        <p className="text-xs text-gray-500 mt-1">Last 6 months performance</p>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No revenue data available</p>
                </div>
            </div>
        );
    }

    const averageRevenue = data.reduce((sum, point) => sum + point.revenue, 0) / data.length;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Revenue Trend</h3>
                    <p className="text-xs text-gray-500 mt-1">Last 6 months performance</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="text-sm font-semibold text-gray-900">KES {formatCurrency(averageRevenue)}</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#093756"
                        strokeWidth={3}
                        dot={{ fill: '#093756', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Revenue (KES)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
