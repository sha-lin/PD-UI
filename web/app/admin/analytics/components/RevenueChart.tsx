"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
} from "recharts";
import { SalesPerformanceTrendItem } from "../types";

interface RevenueChartProps {
    data: SalesPerformanceTrendItem[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        monthLabel: new Date(item.month + "-01").toLocaleDateString("en-US", {
            month: "short",
        }),
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Revenue Trend <span className="text-sm font-normal text-gray-500">(KES)</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Monthly revenue performance over the past 12 months
                </p>
            </div>
            <ResponsiveContainer width="100%" height={420}>
                <ComposedChart
                    data={formattedData}
                    margin={{ top: 10, right: 20, bottom: 40, left: -20 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#093756" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#093756" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="monthLabel"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        stroke="#d1d5db"
                        tickLine={false}
                        axisLine={{ stroke: "#d1d5db" }}
                        label={{
                            value: "Month",
                            position: "insideBottom",
                            offset: -30,
                            style: { fill: "#6b7280", fontSize: 12, fontWeight: 500 }
                        }}
                    />
                    <YAxis
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        stroke="#d1d5db"
                        tickLine={false}
                        axisLine={{ stroke: "#d1d5db" }}
                        width={45}
                        tickMargin={5}
                        tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                            return value.toString();
                        }}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [
                            `KES ${(value ?? 0).toLocaleString()}`,
                            "Revenue",
                        ]}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        fill="url(#colorRevenue)"
                        stroke="none"
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#093756"
                        strokeWidth={3}
                        dot={{ fill: "#093756", r: 4, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
