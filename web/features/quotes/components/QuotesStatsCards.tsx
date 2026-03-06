import type { QuoteStatsResponse } from "@/types/quotes";

interface QuotesStatsCardsProps {
    stats: QuoteStatsResponse;
}

export default function QuotesStatsCards({ stats }: QuotesStatsCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Total Quotes
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_quotes}</p>
                <p className="text-xs text-gray-400 mt-1">All active quotes</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Pending Costing
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending_costing}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting production team</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Total Value
                </p>
                <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.total_value)}
                </p>
                <p className="text-xs text-green-600 mt-1">Active quotes</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Avg Margin
                </p>
                <p className="text-3xl font-bold text-gray-900">
                    {stats.avg_margin.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 ${stats.avg_margin >= 25 ? "text-green-600" : "text-yellow-600"}`}>
                    {stats.avg_margin >= 25 ? "Above target" : "Below target"}
                </p>
            </div>
        </div>
    );
}
