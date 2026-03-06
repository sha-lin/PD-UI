"use client";

import type { ReactElement } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TopProduct } from "@/types/dashboard";

interface TopProductsChartProps {
    data: TopProduct[];
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

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: TopProduct }> }): ReactElement | null => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-xs font-medium text-gray-900">{data.name}</p>
            <p className="text-sm font-bold text-brand-blue mt-1">
                KES {data.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
                {data.count} {data.count === 1 ? 'sale' : 'sales'}
            </p>
        </div>
    );
};

export default function TopProductsChart({ data, isLoading }: TopProductsChartProps): ReactElement {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Top Products</h3>
                    <p className="text-xs text-gray-500 mt-1">Highest revenue generators</p>
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
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Top Products</h3>
                    <p className="text-xs text-gray-500 mt-1">Highest revenue generators</p>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No product data available</p>
                </div>
            </div>
        );
    }

    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Top Products</h3>
                <p className="text-xs text-gray-500 mt-1">Highest revenue generators</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={formatCurrency}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                    <Bar
                        dataKey="revenue"
                        fill="#009444"
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
