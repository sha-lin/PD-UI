import { ClockIcon, CalendarIcon, TrendingUpIcon, TimerIcon } from "lucide-react";
import { TimeInsights } from "../types";

interface TimeInsightsCardProps {
    data: TimeInsights;
}

export default function TimeInsightsCard({ data }: TimeInsightsCardProps) {
    const getDayLabel = (day: string | undefined): string | undefined => {
        if (!day) return undefined;
        const days: Record<string, string> = {
            monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
            thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
        };
        return days[day.toLowerCase()] || day;
    };

    const formatHour = (hour: number | undefined): string | undefined => {
        if (hour === undefined || hour === null) return undefined;
        if (hour === 0) return "12 AM";
        if (hour === 12) return "12 PM";
        if (hour < 12) return `${hour} AM`;
        return `${hour - 12} PM`;
    };

    const hasData = data.peak_order_day || data.peak_order_hour !== undefined || data.busiest_month || data.average_order_processing_days;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Time-Based Insights</h3>
            {!hasData ? (
                <div className="py-12 text-center">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No time-based data available yet</p>
                    <p className="text-gray-400 text-xs mt-1">Insights will appear once order data is collected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.peak_order_day && (
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white">
                                <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peak Order Day</div>
                                <div className="text-xl font-semibold text-gray-900 mt-1">
                                    {getDayLabel(data.peak_order_day)}
                                </div>
                            </div>
                        </div>
                    )}

                    {data.peak_order_hour !== undefined && data.peak_order_hour !== null && (
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow text-white">
                                <ClockIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peak Order Hour</div>
                                <div className="text-xl font-semibold text-gray-900 mt-1">
                                    {formatHour(data.peak_order_hour)}
                                </div>
                            </div>
                        </div>
                    )}

                    {data.busiest_month && (
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green text-white">
                                <TrendingUpIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Busiest Month</div>
                                <div className="text-xl font-semibold text-gray-900 mt-1">
                                    {data.busiest_month}
                                </div>
                            </div>
                        </div>
                    )}

                    {data.average_order_processing_days !== undefined && data.average_order_processing_days !== null && (
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple text-white">
                                <TimerIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Processing Time</div>
                                <div className="text-xl font-semibold text-gray-900 mt-1">
                                    {data.average_order_processing_days} days
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
