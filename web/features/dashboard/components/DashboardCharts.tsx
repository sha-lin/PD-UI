"use client";

import type { ReactElement } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { RevenueChartPoint } from "@/types/dashboard";

interface DashboardChartsProps {
    revenueSeries: RevenueChartPoint[];
}

export default function DashboardCharts({ revenueSeries }: DashboardChartsProps): ReactElement {
    return (
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
                    <p className="mt-1 text-sm text-gray-600">Monthly revenue and order trends</p>
                </div>
            </div>
            <div className="mt-6 h-[340px]">
                {revenueSeries.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <p className="text-sm">No sales data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueSeries} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                tickFormatter={(value: number): string => `${Math.round(value / 1000)}k`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value: number | string | undefined, key: string | undefined): [string, string] => {
                                    const numericValue = typeof value === "number" ? value : Number(value || 0);

                                    if (key === "revenue") {
                                        return [`KES ${numericValue.toLocaleString("en-US")}`, "Revenue"];
                                    }

                                    return [numericValue.toLocaleString("en-US"), "Orders"];
                                }}
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <Legend
                                iconType="line"
                                wrapperStyle={{ paddingTop: "16px" }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (KES)"
                                stroke="#093756"
                                strokeWidth={3}
                                dot={{ fill: "#093756", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                name="Orders"
                                stroke="#F6B619"
                                strokeWidth={3}
                                dot={{ fill: "#F6B619", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </article>
    );
}
