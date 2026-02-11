import type { ReactElement } from "react";
import { QCInspection } from "@/types/quality-control";
import QCStatusBadge from "./QCStatusBadge";

interface QCInspectionsTableProps {
    inspections: QCInspection[];
    onView: (inspection: QCInspection) => void;
}

export default function QCInspectionsTable({ inspections, onView }: QCInspectionsTableProps): ReactElement {
    const formatDate = (value: string): string => {
        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const createViewHandler = (inspection: QCInspection): (() => void) => {
        return (): void => {
            onView(inspection);
        };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">QC ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inspector</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {inspections.map((inspection: QCInspection): ReactElement => (
                        <tr key={inspection.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                #{inspection.id}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {inspection.job_number || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {inspection.client_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {inspection.vendor_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                <QCStatusBadge status={inspection.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {inspection.inspector_name || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {formatDate(inspection.inspection_date)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    type="button"
                                    onClick={createViewHandler(inspection)}
                                    className="text-brand-blue text-sm font-semibold hover:text-brand-blue/80"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
