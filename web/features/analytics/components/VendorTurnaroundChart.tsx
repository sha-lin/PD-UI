import type { ReactElement } from "react";
import type { VendorTurnaroundTime } from "@/types/analytics";
import { TimerIcon } from "lucide-react";

interface VendorTurnaroundChartProps {
    vendors: VendorTurnaroundTime[];
}

export default function VendorTurnaroundChart({ vendors }: VendorTurnaroundChartProps): ReactElement {
    const maxDays = vendors.length > 0 ? Math.max(...vendors.map((v) => v.avg_days), 10) : 10;
    const targetDays = 5;

    const getPerformanceColor = (performance: string): string => {
        switch (performance) {
            case "Excellent":
                return "bg-green-500";
            case "Good":
                return "bg-brand-blue";
            default:
                return "bg-brand-red";
        }
    };

    const getPerformanceTextColor = (performance: string): string => {
        switch (performance) {
            case "Excellent":
                return "text-green-600";
            case "Good":
                return "text-brand-blue";
            default:
                return "text-red-600";
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Turnaround Time Performance</h3>
                    <p className="mt-1 text-sm text-gray-600">Average days to complete jobs (Target: {targetDays} days)</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-2">
                    <TimerIcon className="h-5 w-5 text-purple-600" />
                </div>
            </div>

            {vendors.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-gray-500">No turnaround data available</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vendors.map((vendor, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPerformanceTextColor(
                                            vendor.performance
                                        )} bg-opacity-10`}
                                        style={{
                                            backgroundColor:
                                                vendor.performance === "Excellent"
                                                    ? "rgb(34 197 94 / 0.1)"
                                                    : vendor.performance === "Good"
                                                        ? "rgb(9 55 86 / 0.1)"
                                                        : "rgb(237 28 36 / 0.1)",
                                        }}
                                    >
                                        {vendor.performance}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{vendor.jobs} jobs</span>
                                    <span className={`text-sm font-bold ${getPerformanceTextColor(vendor.performance)}`}>
                                        {vendor.avg_days.toFixed(1)}d
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full transition-all duration-300 ${getPerformanceColor(vendor.performance)}`}
                                    style={{ width: `${Math.min((vendor.avg_days / maxDays) * 100, 100)}%` }}
                                ></div>
                                {targetDays <= maxDays && (
                                    <div
                                        className="absolute top-0 h-full w-0.5 bg-gray-400"
                                        style={{ left: `${(targetDays / maxDays) * 100}%` }}
                                        title={`Target: ${targetDays} days`}
                                    ></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Excellent (≤3d)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-brand-blue"></div>
                    <span>Good (≤7d)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-brand-red"></div>
                    <span>Needs Work (&gt;7d)</span>
                </div>
            </div>
        </div>
    );
}
