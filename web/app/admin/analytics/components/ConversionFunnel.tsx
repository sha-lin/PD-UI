"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ConversionMetrics } from "../types";

interface ConversionFunnelProps {
    data: ConversionMetrics;
}

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
    const leadToClient = data.lead_to_client ?? 0;
    const quoteToOrder = data.quote_to_order ?? 0;
    const totalLeads = data.total_leads ?? 0;
    const convertedClients = data.converted_clients ?? 0;

    const funnelData = [
        {
            stage: "Total Leads",
            count: totalLeads,
            color: "#093756",
        },
        {
            stage: "Converted Clients",
            count: convertedClients,
            color: "#009444",
        },
        {
            stage: "Quote to Order",
            count: Math.round(convertedClients * (quoteToOrder / 100)),
            color: "#F6B619",
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
                    <p className="text-sm text-gray-600 mt-1">Lead to order conversion rates</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-600">Lead → Client</div>
                    <div className="text-2xl font-bold text-brand-green">{leadToClient.toFixed(1)}%</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} stroke="#d1d5db" />
                    <YAxis dataKey="stage" type="category" tick={{ fill: "#6b7280", fontSize: 12 }} stroke="#d1d5db" width={150} />
                    <Tooltip
                        formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), "Count"]}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                    <div className="text-xs text-gray-600">Quote Conversion</div>
                    <div className="text-lg font-semibold text-gray-900">{quoteToOrder.toFixed(1)}%</div>
                </div>
                <div>
                    <div className="text-xs text-gray-600">Total Pipeline</div>
                    <div className="text-lg font-semibold text-gray-900">{totalLeads.toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}
