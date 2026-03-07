import type { ReactElement } from "react";
import type { Job, JobStatus } from "@/types/jobs";

interface JobsTableProps {
    jobs: Job[];
    onViewDetails: (job: Job) => void;
    onAssign?: (job: Job) => void;
    onProgress?: (job: Job) => void;
    onSendReminder?: (job: Job) => void;
    showAssignButton?: boolean;
    showProgressButton?: boolean;
    showReminderButton?: boolean;
    remindingJobId?: number;
}

const statusStyles: Record<JobStatus, string> = {
    pending: "bg-brand-yellow/20 text-brand-black",
    in_progress: "bg-brand-blue/10 text-brand-blue",
    on_hold: "bg-brand-red/10 text-brand-red",
    completed: "bg-brand-green/10 text-brand-green",
};

export default function JobsTable({
    jobs,
    onViewDetails,
    onAssign,
    onProgress,
    onSendReminder,
    showAssignButton = true,
    showProgressButton = false,
    showReminderButton = false,
    remindingJobId,
}: JobsTableProps): ReactElement {
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

    const isOverdue = (job: Job): boolean => {
        if (!job.expected_completion || job.status === "completed") {
            return false;
        }
        return new Date(job.expected_completion) < new Date();
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job #</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job: Job): ReactElement => {
                        const overdue = isOverdue(job);
                        return (
                            <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                    {job.job_number || "—"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {job.client?.name || "—"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    <div className="font-semibold text-gray-900">{job.job_name}</div>
                                    <div className="text-xs text-gray-500">{job.product}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {job.quantity}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[job.status]}`}>
                                        {job.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {job.person_in_charge
                                        ? `${job.person_in_charge.first_name} ${job.person_in_charge.last_name}`
                                        : "—"}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={overdue ? "text-brand-red font-semibold" : "text-gray-700"}>
                                        {formatDate(job.expected_completion)}
                                    </span>
                                    {overdue && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-brand-red/10 px-2 py-0.5 text-xs font-medium text-brand-red">
                                            Overdue
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={(): void => onViewDetails(job)}
                                            className="text-xs font-medium text-gray-600 hover:text-gray-900"
                                        >
                                            View
                                        </button>
                                        {showAssignButton && onAssign && (
                                            <button
                                                type="button"
                                                onClick={(): void => onAssign(job)}
                                                className="rounded-md bg-brand-blue px-3 py-1 text-xs font-medium text-white hover:bg-brand-blue/90"
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {showProgressButton && onProgress && (
                                            <button
                                                type="button"
                                                onClick={(): void => onProgress(job)}
                                                className="rounded-md bg-brand-green px-3 py-1 text-xs font-medium text-white hover:bg-brand-green/90"
                                            >
                                                Progress
                                            </button>
                                        )}
                                        {showReminderButton && onSendReminder && job.person_in_charge && (
                                            <button
                                                type="button"
                                                onClick={(): void => onSendReminder(job)}
                                                disabled={remindingJobId === job.id}
                                                className="rounded-md bg-brand-yellow px-3 py-1 text-xs font-medium text-brand-black hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                                            >
                                                {remindingJobId === job.id && (
                                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {remindingJobId === job.id ? "Sending..." : "Remind"}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

