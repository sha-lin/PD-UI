import type { ReactElement } from "react";
import type { Job, JobStatus } from "@/types/jobs";

interface JobsTableProps {
    jobs: Job[];
    onView: (job: Job) => void;
    onAssign: (job: Job) => void;
    onProgress: (job: Job) => void;
}

const statusStyles: Record<JobStatus, string> = {
    pending: "bg-brand-yellow/20 text-brand-black",
    in_progress: "bg-brand-blue/10 text-brand-blue",
    on_hold: "bg-brand-red/10 text-brand-red",
    completed: "bg-brand-green/10 text-brand-green",
};

export default function JobsTable({ jobs, onView, onAssign, onProgress }: JobsTableProps): ReactElement {
    const formatDate = (value: string | null): string => {
        if (!value) {
            return "—";
        }
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const createViewHandler = (job: Job): (() => void) => {
        return (): void => {
            onView(job);
        };
    };

    const createAssignHandler = (job: Job): (() => void) => {
        return (): void => {
            onAssign(job);
        };
    };

    const createProgressHandler = (job: Job): (() => void) => {
        return (): void => {
            onProgress(job);
        };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job #</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Completion</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job: Job): ReactElement => (
                        <tr key={job.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                {job.job_number || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {job.quote ?? "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">{job.job_name}</div>
                                <div className="text-xs text-gray-500">{job.product}</div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[job.status]}`}>
                                    {job.status.replace("_", " ")}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(job.expected_completion)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                                {formatDate(job.created_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={createViewHandler(job)}
                                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createAssignHandler(job)}
                                        className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                    >
                                        Assign
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createProgressHandler(job)}
                                        className="text-sm font-semibold text-brand-green hover:text-brand-green/80"
                                    >
                                        Progress
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
