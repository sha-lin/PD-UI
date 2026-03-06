import type { ReactElement } from "react";
import type { VendorQualityScore } from "@/types/analytics";
import { StarIcon, TrendingUpIcon } from "lucide-react";

interface VendorQualityChartProps {
    vendors: VendorQualityScore[];
}

export default function VendorQualityChart({ vendors }: VendorQualityChartProps): ReactElement {
    const maxScore = 5.0;

    const getScoreColor = (score: number): string => {
        if (score >= 4.5) return "bg-green-500";
        if (score >= 4.0) return "bg-brand-yellow";
        return "bg-brand-red";
    };

    const getScoreTextColor = (score: number): string => {
        if (score >= 4.5) return "text-green-600";
        if (score >= 4.0) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Vendor Quality Scores</h3>
                    <p className="mt-1 text-sm text-gray-600">Top {vendors.length} vendors by quality rating</p>
                </div>
                <div className="rounded-lg bg-brand-yellow/10 p-2">
                    <StarIcon className="h-5 w-5 text-brand-yellow" />
                </div>
            </div>

            {vendors.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-gray-500">No vendor quality data available</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vendors.map((vendor, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{vendor.jobs} jobs</span>
                                    <span className={`text-sm font-bold ${getScoreTextColor(vendor.score)}`}>
                                        {vendor.score.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full transition-all duration-300 ${getScoreColor(vendor.score)}`}
                                    style={{ width: `${(vendor.score / maxScore) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Excellent (≥4.5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-brand-yellow"></div>
                    <span>Good (≥4.0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-brand-red"></div>
                    <span>Needs Work (&lt;4.0)</span>
                </div>
            </div>
        </div>
    );
}
