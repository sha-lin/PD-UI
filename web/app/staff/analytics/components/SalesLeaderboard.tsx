import { StaffPerformance } from "../types";

interface SalesLeaderboardProps {
    staffPerformance: StaffPerformance;
}

export default function SalesLeaderboard({
    staffPerformance,
}: SalesLeaderboardProps) {
    const { sales_leaderboard } = staffPerformance;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Top Sales Representatives
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                                Name
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                                Deals
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                                Win Rate
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                                Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales_leaderboard.length > 0 ? (
                            sales_leaderboard.map((rep, index) => (
                                <tr key={index} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-brand-blue">
                                                    {rep.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {rep.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-700">
                                        {rep.deals_closed}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-green/10 text-brand-green">
                                            {rep.win_rate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                                        KES {rep.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-500">
                                    No performance data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
