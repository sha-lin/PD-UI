"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { JobVendorStage, JobVendorStageStatus, UpdateJobVendorStagePayload } from "@/types/jobs";

interface JobProgressModalProps {
    open: boolean;
    stages: JobVendorStage[];
    vendorOptions: { id: number; name: string }[];
    onClose: () => void;
    onSubmit: (stageId: number, payload: UpdateJobVendorStagePayload) => void;
}

const statusOptions: JobVendorStageStatus[] = [
    "pending",
    "sent_to_vendor",
    "in_production",
    "completed",
    "issues",
];

export default function JobProgressModal({
    open,
    stages,
    vendorOptions,
    onClose,
    onSubmit,
}: JobProgressModalProps): ReactElement | null {
    const [stageId, setStageId] = useState<number | null>(null);
    const [status, setStatus] = useState<JobVendorStageStatus>("pending");
    const [progress, setProgress] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");

    useEffect((): void => {
        if (open && stages.length > 0) {
            const firstStage = stages[0];
            setStageId(firstStage.id);
            setStatus(firstStage.status);
            setProgress(firstStage.progress);
            setNotes("");
        }
        if (open && stages.length === 0) {
            setStageId(null);
            setStatus("pending");
            setProgress(0);
            setNotes("");
        }
    }, [open, stages]);

    if (!open) {
        return null;
    }

    const handleSubmit = (): void => {
        if (!stageId) {
            return;
        }

        onSubmit(stageId, {
            status,
            progress,
            notes: notes.trim() || null,
        });
    };

    const handleStageChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const nextId = Number(event.target.value);
        const selected = stages.find((stage: JobVendorStage) => stage.id === nextId);
        setStageId(Number.isNaN(nextId) ? null : nextId);
        if (selected) {
            setStatus(selected.status);
            setProgress(selected.progress);
        }
    };

    const vendorLookup = new Map<number, string>(
        vendorOptions.map((vendor) => [vendor.id, vendor.name])
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Update Progress</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                        Close
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {stages.length === 0 ? (
                        <div className="text-sm text-gray-500">Assign a vendor stage before updating progress.</div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</label>
                                <select
                                    value={stageId ?? ""}
                                    onChange={handleStageChange}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    {stages.map((stage: JobVendorStage): ReactElement => (
                                        <option key={stage.id} value={stage.id}>
                                            {stage.stage_name} ({vendorLookup.get(stage.vendor) || `Vendor ${stage.vendor}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                    <select
                                        value={status}
                                        onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                                            setStatus(event.target.value as JobVendorStageStatus)
                                        }
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        {statusOptions.map((option: JobVendorStageStatus): ReactElement => (
                                            <option key={option} value={option}>
                                                {option.replace("_", " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progress (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={progress}
                                        onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                            setProgress(Number(event.target.value))
                                        }
                                        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => setNotes(event.target.value)}
                                    rows={3}
                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={stages.length === 0}
                        className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90 disabled:opacity-60"
                    >
                        Save Progress
                    </button>
                </div>
            </div>
        </div>
    );
}
