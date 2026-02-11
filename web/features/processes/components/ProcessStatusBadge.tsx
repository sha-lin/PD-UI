import type { ReactElement } from "react";
import { ProcessStatus } from "@/types/processes";

interface ProcessStatusBadgeProps {
    status: ProcessStatus;
}

export default function ProcessStatusBadge({ status }: ProcessStatusBadgeProps): ReactElement {
    const styles: Record<ProcessStatus, string> = {
        active: "bg-brand-green/10 text-brand-green",
        draft: "bg-brand-yellow/10 text-brand-yellow",
        inactive: "bg-gray-100 text-gray-700",
    };

    const labels: Record<ProcessStatus, string> = {
        active: "Active",
        draft: "Draft",
        inactive: "Inactive",
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
