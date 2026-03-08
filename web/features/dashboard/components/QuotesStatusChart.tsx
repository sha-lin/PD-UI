"use client";

import type { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { DashboardOverview } from "@/types/dashboard";

interface QuotesStatusChartProps {
    overview: DashboardOverview;
}

const STATUS_COLORS: Record<string, string> = {
    Draft: "#9CA3AF",
    Sent: "#093756",
    Approved: "#009444",
    Lost: "#ED1C24",
    Ecommerce: "#F6B619",
};

export default function QuotesStatusChart({ overview }: QuotesStatusChartProps): ReactElement {
    const chartData = [
        { name: "Draft", value: overview.quotes.draft, color: STATUS_COLORS["Draft"] },
        { name: "Sent", value: overview.quotes.sent_to_customer, color: STATUS_COLORS["Sent"] },
        { name: "Approved", value: overview.quotes.approved, color: STATUS_COLORS["Approved"] },
        { name: "Lost", value: overview.quotes.lost, color: STATUS_COLORS["Lost"] },
        { name: "Ecommerce", value: overview.quotes.ecommerce, color: STATUS_COLORS["Ecommerce"] },
    ];

    const approvalRate =
        overview.quotes.total > 0
            ? Math.round((overview.quotes.approved / overview.quotes.total) * 100)
            : 0;

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Quote Performance</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {overview.quotes.total} total · {approvalRate}% approval rate
                    </p>
                </div>
            </div>
            <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(9, 55, 86, 0.05)" }}
                            formatter={(value: number | undefined): [string, string] => [
                                `${value ?? 0} quotes`,
                                "Count",
                            ]}
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}
