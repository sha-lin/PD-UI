"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PerformanceGaugeChartProps {
    label: string;
    value: number;
    target: number;
    unit?: string;
    description?: string;
    inverse?: boolean;
}

export default function PerformanceGaugeChart({
    label,
    value,
    target,
    unit = "%",
    description,
    inverse = false,
}: PerformanceGaugeChartProps) {
    const percentage = Math.min(value, 100);

    const getColor = () => {
        if (inverse) {
            if (value <= target) return "#10b981";
            if (value <= target * 2) return "#f59e0b";
            return "#ef4444";
        } else {
            if (value >= target) return "#10b981";
            if (value >= target * 0.7) return "#f59e0b";
            return "#ef4444";
        }
    };

    const data = [
        { name: "value", value: percentage },
        { name: "remaining", value: 100 - percentage },
    ];

    const color = getColor();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-4">{label}</p>

                <div className="relative w-40 h-40 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={color} />
                                <Cell fill="#e5e7eb" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                        <div className="text-3xl font-bold" style={{ color }}>
                            {value}
                            <span className="text-lg">{unit}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Target: {target}{unit}
                        </div>
                    </div>
                </div>

                {description && (
                    <p className="text-xs text-gray-500 mt-4">{description}</p>
                )}
            </div>
        </div>
    );
}
