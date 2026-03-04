import type { ReactElement } from "react";
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";
import type { DashboardAlert } from "@/types/dashboard";

interface DashboardAlertsProps {
    alerts: DashboardAlert[];
}

export default function DashboardAlerts({ alerts }: DashboardAlertsProps): ReactElement {
    const getIcon = (severity: string): ReactElement => {
        if (severity === "error" || severity === "critical") {
            return <AlertCircleIcon className="h-4 w-4 text-brand-red" />;
        }

        if (severity === "warning") {
            return <AlertTriangleIcon className="h-4 w-4 text-brand-yellow" />;
        }

        return <InfoIcon className="h-4 w-4 text-brand-blue" />;
    };

    const getCardStyle = (severity: string): string => {
        if (severity === "error" || severity === "critical") {
            return "border-brand-red/30 bg-brand-red/5";
        }

        if (severity === "warning") {
            return "border-brand-yellow/30 bg-brand-yellow/10";
        }

        return "border-brand-blue/30 bg-brand-blue/5";
    };

    const formatRelativeTime = (value: string): string => {
        const now = new Date().getTime();
        const created = new Date(value).getTime();
        const deltaMinutes = Math.max(1, Math.floor((now - created) / (1000 * 60)));

        if (deltaMinutes < 60) {
            return `${deltaMinutes}m ago`;
        }

        const deltaHours = Math.floor(deltaMinutes / 60);
        if (deltaHours < 24) {
            return `${deltaHours}h ago`;
        }

        const deltaDays = Math.floor(deltaHours / 24);
        return `${deltaDays}d ago`;
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
                <a href="/staff/alerts" className="text-sm font-medium text-brand-blue hover:underline">
                    View all
                </a>
            </div>

            <div className="mt-4 space-y-3">
                {alerts.length === 0 ? (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">No active alerts right now.</p>
                    </div>
                ) : (
                    alerts.map((alert: DashboardAlert): ReactElement => (
                        <article key={alert.id} className={`rounded-md border p-3 ${getCardStyle(alert.severity)}`}>
                            <div className="flex items-start gap-2">
                                <span className="mt-0.5">{getIcon(alert.severity)}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                                    <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
                                    <p className="mt-2 text-xs text-gray-500">{formatRelativeTime(alert.created_at)}</p>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
