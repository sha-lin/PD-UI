"use client";

import type { ReactElement } from "react";
import type { AccountManagerKPIs } from "@/types/dashboard";

interface DashboardKPICardsProps {
    kpis: AccountManagerKPIs;
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

export default function DashboardKPICards({ kpis, isLoading }: DashboardKPICardsProps): ReactElement {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Revenue This Month
                </p>
                <p className="text-3xl font-bold text-brand-blue">
                    {formatCurrency(kpis.my_revenue_this_month)}
                </p>
                <p className="text-xs text-gray-500 mt-1">KES</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Win Rate
                </p>
                <p className="text-3xl font-bold text-brand-green">
                    {kpis.my_win_rate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Approved / Total Quotes</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Active Jobs
                </p>
                <p className="text-3xl font-bold text-brand-yellow">
                    {kpis.active_jobs_count}
                </p>
                <p className="text-xs text-gray-500 mt-1">Pending + In Progress</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    New Clients
                </p>
                <p className="text-3xl font-bold text-brand-blue">
                    {kpis.new_clients_this_month}
                </p>
                <p className="text-xs text-gray-500 mt-1">This Month</p>
            </div>
        </div>
    );
}
