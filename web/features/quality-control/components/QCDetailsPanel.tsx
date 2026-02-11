import type { ReactElement } from "react";
import { QCInspection, QCStatus } from "@/types/quality-control";
import QCStatusBadge from "./QCStatusBadge";

interface QCDetailsPanelProps {
    inspection: QCInspection | null;
    onClose: () => void;
    onStatusUpdate: (inspectionId: number, status: QCStatus) => void;
    isUpdating: boolean;
    errorMessage: string | null;
}

interface ChecklistItem {
    label: string;
    value: boolean;
}

interface ActionButton {
    label: string;
    status: QCStatus;
    style: string;
}

export default function QCDetailsPanel({
    inspection,
    onClose,
    onStatusUpdate,
    isUpdating,
    errorMessage,
}: QCDetailsPanelProps): ReactElement | null {
    if (!inspection) {
        return null;
    }

    const formatDate = (value: string): string => {
        return new Date(value).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });
    };

    const checklistItems: ChecklistItem[] = [
        { label: "Color accuracy", value: inspection.color_accuracy },
        { label: "Print quality", value: inspection.print_quality },
        { label: "Cutting accuracy", value: inspection.cutting_accuracy },
        { label: "Finishing quality", value: inspection.finishing_quality },
        { label: "Quantity verified", value: inspection.quantity_verified },
        { label: "Packaging checked", value: inspection.packaging_checked },
    ];

    const actionButtons: ActionButton[] = [
        { label: "Pass", status: "passed", style: "bg-brand-green text-white" },
        { label: "Fail", status: "failed", style: "bg-brand-red text-white" },
        { label: "Rework", status: "rework", style: "bg-brand-orange text-white" },
    ];

    const createStatusHandler = (status: QCStatus): (() => void) => {
        return (): void => {
            onStatusUpdate(inspection.id, status);
        };
    };

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-black/30"
                aria-label="Close QC details"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">QC Details</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">#{inspection.id}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        Close
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {inspection.job_number || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {inspection.client_name || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quote</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {inspection.quote_id || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {inspection.vendor_name || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inspector</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {inspection.inspector_name || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inspection Date</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                                {formatDate(inspection.inspection_date)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div className="mt-2">
                            <QCStatusBadge status={inspection.status} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checklist</div>
                        <div className="mt-2 space-y-2">
                            {checklistItems.map((item: ChecklistItem): ReactElement => (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.label}</span>
                                    <span className="font-semibold text-gray-900">{item.value ? "Yes" : "No"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</div>
                        <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {inspection.notes || "No notes recorded."}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Update Status</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {actionButtons.map((button: ActionButton): ReactElement => (
                                <button
                                    key={button.status}
                                    type="button"
                                    onClick={createStatusHandler(button.status)}
                                    disabled={isUpdating || inspection.status === button.status}
                                    className={`px-3 py-2 rounded-md text-xs font-semibold ${button.style} disabled:opacity-50`}
                                >
                                    {isUpdating && inspection.status !== button.status ? "Updating..." : button.label}
                                </button>
                            ))}
                        </div>
                        {errorMessage && (
                            <p className="mt-3 text-xs text-brand-red">{errorMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
