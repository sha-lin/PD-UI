import type { ReactElement } from "react";
import type { DashboardActivity } from "@/types/dashboard";

interface DashboardRecentActivityProps {
    activities: DashboardActivity[];
}

export default function DashboardRecentActivity({ activities }: DashboardRecentActivityProps): ReactElement {
    const formatDateTime = (value: string): string => {
        return new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <a href="/staff/activity" className="text-sm font-medium text-brand-blue hover:underline">
                    View all
                </a>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Type</th>
                            <th className="px-3 py-2 font-medium">Details</th>
                            <th className="px-3 py-2 font-medium">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                                    No recent activity.
                                </td>
                            </tr>
                        ) : (
                            activities.map((activity: DashboardActivity): ReactElement => (
                                <tr key={activity.id} className="border-b border-gray-100 last:border-b-0">
                                    <td className="px-3 py-3 font-medium text-gray-900">{activity.title}</td>
                                    <td className="px-3 py-3 text-gray-700 uppercase tracking-wide text-xs">
                                        {activity.activity_type}
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 max-w-[420px] truncate">{activity.description}</td>
                                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                        {formatDateTime(activity.created_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
