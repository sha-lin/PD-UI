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
        <section>
            <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
                    <span className="text-xs text-gray-500">Revenue and orders trend</span>
                </div>
                <div className="mt-4 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueSeries} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis yAxisId="left" tickFormatter={(value: number): string => `${Math.round(value / 1000)}k`} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                formatter={(value: number | string | undefined, key: string | undefined): [string, string] => {
                                    const numericValue = typeof value === "number" ? value : Number(value || 0);

                                    if (key === "revenue") {
                                        return [`KES ${numericValue.toLocaleString("en-US")}`, "Revenue"];
                                    }

                                    return [numericValue.toLocaleString("en-US"), "Orders"];
                                }}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#093756"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                name="Orders"
                                stroke="#F6B619"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </article>
        </section>
    );
}
