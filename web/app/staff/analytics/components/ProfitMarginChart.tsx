"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ProfitMargins } from "../types";

interface ProfitMarginChartProps {
    data: ProfitMargins;
}

export default function ProfitMarginChart({ data }: ProfitMarginChartProps) {
    const chartData = [
        { name: "Profit", value: data.gross_profit },
        { name: "Cost", value: data.total_cost },
    ];

    const COLORS = ["#009444", "#f1f5f9"];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Profit Margin Analysis
            </h3>
            <div className="relative">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={0}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) =>
                                `${value}: KES ${(entry.payload?.value ?? 0).toLocaleString()}`
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-bold text-gray-900">
                        {data.overall_margin.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Net Margin</div>
                </div>
            </div>
        </div>
    );
}
