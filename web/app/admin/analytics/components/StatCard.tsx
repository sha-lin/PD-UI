import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    trend?: number;
    trendLabel?: string;
    icon?: React.ReactNode;
    showPercentage?: boolean;
}

export default function StatCard({
    title,
    value,
    trend,
    trendLabel,
    showPercentage = false,
}: StatCardProps) {
    const isPositive = trend !== undefined && trend > 0;
    const hasTrend = trend !== undefined && trend !== 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {title}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            {hasTrend && (
                <div className="mt-2 flex items-center gap-1.5">
                    {isPositive ? (
                        <ArrowUpIcon className="h-3.5 w-3.5 text-brand-green" />
                    ) : (
                        <ArrowDownIcon className="h-3.5 w-3.5 text-brand-red" />
                    )}
                    <span
                        className={`text-xs font-medium ${isPositive ? "text-brand-green" : "text-brand-red"
                            }`}
                    >
                        {showPercentage ? `${trend}%` : trend.toLocaleString()}
                    </span>
                    {trendLabel && (
                        <span className="text-xs text-gray-500">{trendLabel}</span>
                    )}
                </div>
            )}
        </div>
    );
}
