"use client";

import type { ReactElement } from "react";

interface LeadsStatsCardsProps {
    stats: {
        total: number;
        new: number;
        qualified: number;
        converted: number;
    };
}

export default function LeadsStatsCards({ stats }: LeadsStatsCardsProps): ReactElement {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Total Leads
                    </span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</span>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        New Leads
                    </span>
                    <span className="text-3xl font-bold text-blue-600 mt-2">{stats.new}</span>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Qualified
                    </span>
                    <span className="text-3xl font-bold text-green-600 mt-2">{stats.qualified}</span>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Converted
                    </span>
                    <span className="text-3xl font-bold text-brand-green mt-2">{stats.converted}</span>
                </div>
            </div>
        </div>
    );
}
