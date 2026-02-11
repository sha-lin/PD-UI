import type { ReactElement } from "react";
import { Process } from "@/types/processes";
import ProcessStatusBadge from "./ProcessStatusBadge";

interface ProcessesTableProps {
    processes: Process[];
    onView: (process: Process) => void;
    onEdit: (process: Process) => void;
    onDelete: (process: Process) => void;
    onManageRanges: (process: Process) => void;
}

export default function ProcessesTable({
    processes,
    onView,
    onEdit,
    onDelete,
    onManageRanges,
}: ProcessesTableProps): ReactElement {
    const formatDate = (value: string): string => {
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const createViewHandler = (process: Process): (() => void) => {
        return (): void => {
            onView(process);
        };
    };

    const createEditHandler = (process: Process): (() => void) => {
        return (): void => {
            onEdit(process);
        };
    };

    const createDeleteHandler = (process: Process): (() => void) => {
        return (): void => {
            onDelete(process);
        };
    };

    const createRangesHandler = (process: Process): (() => void) => {
        return (): void => {
            onManageRanges(process);
        };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Process</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pricing</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead Time</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processes.map((process: Process): ReactElement => (
                        <tr key={process.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4">
                                <div className="text-sm font-semibold text-gray-900">{process.process_name}</div>
                                <div className="text-xs text-gray-500">{process.process_id}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {process.category === "outsourced" ? "Outsourced" : "In-house"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {process.pricing_type === "tier" ? "Tier-Based" : "Formula-Based"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <ProcessStatusBadge status={process.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {process.standard_lead_time} days
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(process.created_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={createViewHandler(process)}
                                        className="text-brand-blue text-sm font-semibold hover:text-brand-blue/80"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createEditHandler(process)}
                                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                                    >
                                        Edit
                                    </button>
                                    {process.pricing_type === "formula" && (
                                        <button
                                            type="button"
                                            onClick={createRangesHandler(process)}
                                            className="text-sm font-semibold text-brand-green hover:text-brand-green/80"
                                        >
                                            Ranges
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={createDeleteHandler(process)}
                                        className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                    >
                                        Delete
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
