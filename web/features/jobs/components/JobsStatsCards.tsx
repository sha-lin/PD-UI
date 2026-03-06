import type { ReactElement } from "react";
import { Briefcase, Clock, PlayCircle, AlertTriangle } from "lucide-react";
import type { Job } from "@/types/jobs";

interface JobsStatsCardsProps {
    jobs: Job[];
}

interface JobStats {
    total: number;
    pending: number;
    inProgress: number;
    overdue: number;
}

function calculateJobStats(jobs: Job[]): JobStats {
    const now = new Date();

    return jobs.reduce(
        (stats: JobStats, job: Job): JobStats => {
            stats.total++;

            if (job.status === "pending") {
                stats.pending++;
            } else if (job.status === "in_progress") {
                stats.inProgress++;
            }

            if (job.expected_completion && job.status !== "completed") {
                const dueDate = new Date(job.expected_completion);
                if (dueDate < now) {
                    stats.overdue++;
                }
            }

            return stats;
        },
        { total: 0, pending: 0, inProgress: 0, overdue: 0 }
    );
}

export default function JobsStatsCards({ jobs }: JobsStatsCardsProps): ReactElement {
    const stats = calculateJobStats(jobs);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-gray-500">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-400" />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">In Progress</p>
                        <p className="mt-2 text-3xl font-bold text-brand-yellow">{stats.inProgress}</p>
                    </div>
                    <PlayCircle className="h-8 w-8 text-brand-yellow" />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overdue</p>
                        <p className="mt-2 text-3xl font-bold text-brand-red">{stats.overdue}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-brand-red" />
                </div>
            </div>
        </div>
    );
}
