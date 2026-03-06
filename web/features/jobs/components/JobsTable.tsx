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
                                                className="rounded-md bg-brand-yellow px-3 py-1 text-xs font-medium text-brand-black hover:bg-brand-yellow/90"
                                            >
                                                Remind
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

