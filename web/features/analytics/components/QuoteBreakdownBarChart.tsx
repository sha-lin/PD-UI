import type { ReactElement } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AccountManagerPerformance } from "@/types/analytics";

interface QuoteBreakdownBarChartProps {
    performance: AccountManagerPerformance;
}

const COLORS = {
    approved: "#009444",
    pending: "#F6B619",
    lost: "#ED1C24",
};

export default function QuoteBreakdownBarChart({ performance }: QuoteBreakdownBarChartProps): ReactElement {
    const data = [
        { name: "Approved", value: performance.quotes.approved, color: COLORS.approved },
        { name: "Pending", value: performance.quotes.pending, color: COLORS.pending },
        { name: "Lost", value: performance.quotes.lost, color: COLORS.lost },
    ];

    const maxValue = Math.max(performance.quotes.approved, performance.quotes.pending, performance.quotes.lost, 5);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quote Performance</h3>
                <p className="text-sm text-gray-600 mt-1">Breakdown of quote statuses</p>
            </div>

            {performance.quotes.total === 0 ? (
                <div className="flex items-center justify-center h-80">
                    <p className="text-gray-500 text-sm">No quotes data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#6b7280", fontSize: 14 }}
                            axisLine={{ stroke: "#d1d5db" }}
                        />
                        <YAxis
                            tick={{ fill: "#6b7280", fontSize: 14 }}
                            axisLine={{ stroke: "#d1d5db" }}
                            domain={[0, maxValue]}
                        />
                        <Tooltip
                            formatter={(value) => [`${value || 0} quotes`, "Count"]}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                            }}
                            cursor={{ fill: "#f3f4f6" }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-brand-green">{performance.quotes.approved}</p>
                        <p className="text-xs text-gray-600 mt-1">Approved</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-yellow">{performance.quotes.pending}</p>
                        <p className="text-xs text-gray-600 mt-1">Pending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-brand-red">{performance.quotes.lost}</p>
                        <p className="text-xs text-gray-600 mt-1">Lost</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
