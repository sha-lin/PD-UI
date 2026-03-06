import type { ClientStatsResponse } from "@/types/clients";

interface ClientsStatsCardsProps {
    stats: ClientStatsResponse;
}

export default function ClientsStatsCards({ stats }: ClientsStatsCardsProps) {
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
                    Total Clients
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_clients}</p>
                <p className="text-xs text-gray-400 mt-1">All registered clients</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Active Clients
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.active_clients}</p>
                <p className="text-xs text-green-600 mt-1">
                    {stats.total_clients > 0
                        ? `${Math.round((stats.active_clients / stats.total_clients) * 100)}% of total`
                        : "0% of total"
                    }
                </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    B2B Clients
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.b2b_clients}</p>
                <p className="text-xs text-blue-600 mt-1">Business accounts</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 mb-2">
                    Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.total_revenue)}
                </p>
                <p className="text-xs text-green-600 mt-1">From approved quotes</p>
            </div>
        </div>
    );
}
