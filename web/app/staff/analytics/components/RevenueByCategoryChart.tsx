"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RevenueByCategory } from "../types";

interface RevenueByCategoryChartProps {
    data: RevenueByCategory[];
}

export default function RevenueByCategoryChart({ data }: RevenueByCategoryChartProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="category"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        stroke="#d1d5db"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        stroke="#d1d5db"
                        tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Revenue"]}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                        }}
                    />
                    <Bar dataKey="revenue" fill="#093756" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
