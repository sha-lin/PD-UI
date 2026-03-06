"use client";

import type { ReactElement } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ClientGrowthPoint } from "@/types/dashboard";

interface ClientGrowthChartProps {
    data: ClientGrowthPoint[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }): ReactElement | null => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const b2b = payload.find(p => p.dataKey === "b2b");
    const b2c = payload.find(p => p.dataKey === "b2c");
    const total = (b2b?.value || 0) + (b2c?.value || 0);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="text-xs font-medium text-gray-900 mb-2">{label}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: b2b?.color }} />
                        <span className="text-xs text-gray-600">B2B</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{b2b?.value || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: b2c?.color }} />
                        <span className="text-xs text-gray-600">B2C</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{b2c?.value || 0}</span>
                </div>
                <div className="pt-1 mt-1 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-medium text-gray-700">Total</span>
                        <span className="text-xs font-bold text-brand-blue">{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ClientGrowthChart({ data, isLoading }: ClientGrowthChartProps): ReactElement {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Client Growth</h3>
                    <p className="text-xs text-gray-500 mt-1">Monthly acquisition by type</p>
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
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Client Growth</h3>
                    <p className="text-xs text-gray-500 mt-1">Monthly acquisition by type</p>
                </div>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No client data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Client Growth</h3>
                <p className="text-xs text-gray-500 mt-1">Monthly acquisition by type</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tick={{ fill: '#6b7280' }}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        iconType="rect"
                    />
                    <Bar
                        dataKey="b2b"
                        fill="#093756"
                        name="B2B Clients"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="b2c"
                        fill="#F6B619"
                        name="B2C Clients"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
