import type { ReactElement } from "react";
import type { AccountManagerPerformance } from "@/types/analytics";
import { TrendingUpIcon, UsersIcon, FileTextIcon, TargetIcon } from "lucide-react";

interface PersonalPerformanceCardsProps {
    performance: AccountManagerPerformance;
}

export default function PersonalPerformanceCards({ performance }: PersonalPerformanceCardsProps): ReactElement {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "strong":
                return "text-green-600 bg-green-50 border-green-200";
            case "good":
                return "text-blue-600 bg-blue-50 border-blue-200";
            default:
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case "strong":
                return "Strong Performance";
            case "good":
                return "Good Performance";
            default:
                return "Needs Improvement";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Performance</h2>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                        performance.performance_summary.status
                    )}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {getStatusLabel(performance.performance_summary.status)}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-brand-blue/20 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Quote Conversion</p>
                        <div className="rounded-lg bg-brand-blue/10 p-2">
                            <FileTextIcon className="h-5 w-5 text-brand-blue" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">
                        {performance.quotes.conversion_rate_percent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                        {performance.quotes.approved} of {performance.quotes.total} quotes approved
                    </p>
                </div>

                <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <div className="rounded-lg bg-green-50 p-2">
                            <TrendingUpIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">
                        ${performance.quotes.total_revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                        ${performance.quotes.average_quote_value.toLocaleString()} avg per quote
                    </p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Lead Conversion</p>
                        <div className="rounded-lg bg-purple-50 p-2">
                            <TargetIcon className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">
                        {performance.leads.conversion_rate_percent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                        {performance.leads.converted} of {performance.leads.total} leads converted
                    </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-600">Managed Clients</p>
                        <div className="rounded-lg bg-orange-50 p-2">
                            <UsersIcon className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <p className="mb-1 text-3xl font-bold text-gray-900">{performance.clients.managed}</p>
                    <p className="text-xs text-gray-500">Active client relationships</p>
                </div>
            </div>
        </div>
    );
}
