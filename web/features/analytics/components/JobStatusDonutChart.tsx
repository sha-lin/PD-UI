import type { ReactElement } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { JobCompletionStats } from "@/types/analytics";

interface JobStatusDonutChartProps {
    stats: JobCompletionStats;
}

const COLORS = {
    completed: "#009444",
    in_progress: "#093756",
    pending: "#F6B619",
};

export default function JobStatusDonutChart({ stats }: JobStatusDonutChartProps): ReactElement {
    const data = [
        { name: "Completed", value: stats.completed, color: COLORS.completed },
        { name: "In Progress", value: stats.in_progress, color: COLORS.in_progress },
        { name: "Pending", value: stats.pending, color: COLORS.pending },
    ].filter((item) => item.value > 0);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Job Status Distribution</h3>
                <p className="text-sm text-gray-600 mt-1">Current jobs by status</p>
            </div>

            {stats.total === 0 ? (
                <div className="flex items-center justify-center h-80">
                    <p className="text-gray-500 text-sm">No jobs data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`${value || 0} jobs`, "Count"]}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Jobs</p>
            </div>
        </div>
    );
}
