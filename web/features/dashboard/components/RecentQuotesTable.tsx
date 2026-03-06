"use client";

import type { ReactElement } from "react";
import type { RecentQuote } from "@/types/dashboard";

interface RecentQuotesTableProps {
    quotes: RecentQuote[];
    isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
};

const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("approved")) return "bg-brand-green/10 text-brand-green border-brand-green";
    if (statusLower.includes("lost")) return "bg-brand-red/10 text-brand-red border-brand-red";
    if (statusLower.includes("draft")) return "bg-gray-100 text-gray-700 border-gray-300";
    return "bg-brand-yellow/10 text-brand-black border-brand-yellow";
};

export default function RecentQuotesTable({ quotes, isLoading }: RecentQuotesTableProps): ReactElement {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Quotes</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!quotes || quotes.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Quotes</h3>
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No recent quotes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recent Quotes</h3>
                <p className="text-xs text-gray-500 mt-1">Last 5 quotes created</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote ID</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr key={quote.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {formatDate(quote.created_at)}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-brand-blue">
                                    {quote.quote_id}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {quote.client_name || quote.lead_name || "—"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {quote.product_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {quote.quantity}
                                </td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                                    {formatCurrency(quote.total_amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border ${getStatusColor(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
