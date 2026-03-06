"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface MetricsComparisonChartProps {
    onTimeRate: number;
    qualityScore: number;
    acceptanceRate: number;
    defectRate: number;
}

export default function MetricsComparisonChart({
    onTimeRate,
    qualityScore,
    acceptanceRate,
    defectRate,
}: MetricsComparisonChartProps) {
    const data = [
        {
            metric: "On-Time",
            value: onTimeRate,
            target: 85,
            color: onTimeRate >= 85 ? "#10b981" : onTimeRate >= 70 ? "#f59e0b" : "#ef4444"
        },
        {
            metric: "Quality",
            value: qualityScore,
            target: 95,
            color: qualityScore >= 95 ? "#10b981" : qualityScore >= 80 ? "#f59e0b" : "#ef4444"
        },
        {
            metric: "Acceptance",
            value: acceptanceRate,
            target: 80,
            color: acceptanceRate >= 80 ? "#10b981" : acceptanceRate >= 65 ? "#f59e0b" : "#ef4444"
        },
        {
            metric: "Defects",
            value: defectRate,
            target: 5,
            color: defectRate <= 5 ? "#10b981" : defectRate <= 10 ? "#f59e0b" : "#ef4444",
            inverse: true
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="metric" type="category" />
                    <Tooltip
                        formatter={(value: number | undefined) => {
                            if (value === undefined) return ['N/A', ''];
                            return [`${value.toFixed(1)}%`, ''];
                        }}
                        labelFormatter={(label, payload) => {
                            if (!payload || payload.length === 0) return label;
                            const data = payload[0].payload;
                            return `${label} • Target: ${data.target}%${data.inverse ? ' (lower is better)' : ''}`;
                        }}
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px 12px",
                        }}
                    />
                    {data.map((entry, index) => (
                        <ReferenceLine
                            key={`ref-${index}`}
                            x={entry.target}
                            stroke="#94a3b8"
                            strokeDasharray="3 3"
                            label={{ value: `Target: ${entry.target}%`, position: "top", fill: "#64748b", fontSize: 12 }}
                        />
                    ))}
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-4 text-center">
                Current performance vs targets • Green: Meeting target • Yellow: Needs attention • Red: Critical
            </p>
        </div>
    );
}
