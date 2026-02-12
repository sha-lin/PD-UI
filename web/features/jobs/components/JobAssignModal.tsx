"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { CreateJobVendorStagePayload, JobVendorStageStatus } from "@/types/jobs";
import type { Vendor } from "@/types/vendors";

interface JobAssignModalProps {
    open: boolean;
    vendorOptions: Vendor[];
    defaultStageOrder: number;
    onClose: () => void;
    onSubmit: (payload: CreateJobVendorStagePayload) => void;
}

const statusOptions: JobVendorStageStatus[] = [
    "pending",
    "sent_to_vendor",
    "in_production",
    "completed",
    "issues",
];

export default function JobAssignModal({
    open,
    vendorOptions,
    defaultStageOrder,
    onClose,
    onSubmit,
}: JobAssignModalProps): ReactElement | null {
    const [vendorId, setVendorId] = useState<number | null>(null);
    const [stageName, setStageName] = useState<string>("");
    const [stageOrder, setStageOrder] = useState<number>(defaultStageOrder);
    const [status, setStatus] = useState<JobVendorStageStatus>("pending");
    const [progress, setProgress] = useState<number>(0);
    const [expectedCompletion, setExpectedCompletion] = useState<string>("");
    const [vendorCost, setVendorCost] = useState<string>("0");
    const [notes, setNotes] = useState<string>("");

    useEffect((): void => {
        if (open) {
            setVendorId(null);
            setStageName("");
            setStageOrder(defaultStageOrder);
            setStatus("pending");
            setProgress(0);
            setExpectedCompletion("");
            setVendorCost("0");
            setNotes("");
        }
    }, [open, defaultStageOrder]);

    const vendorLookup = useMemo(() => {
        const map = new Map<number, Vendor>();
        vendorOptions.forEach((vendor: Vendor) => {
            map.set(vendor.id, vendor);
        });
        return map;
    }, [vendorOptions]);

    if (!open) {
        return null;
    }

    const handleSubmit = (): void => {
        if (!vendorId || !stageName.trim()) {
            return;
        }

        onSubmit({
            job: 0,
            vendor: vendorId,
            stage_order: stageOrder,
            stage_name: stageName.trim(),
            status,
            progress,
            expected_completion: expectedCompletion ? new Date(expectedCompletion).toISOString() : null,
            vendor_cost: vendorCost.trim() || "0",
            notes: notes.trim() || null,
        });
    };

    const handleVendorChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const nextId = Number(event.target.value);
        setVendorId(Number.isNaN(nextId) ? null : nextId);
        const vendor = vendorLookup.get(nextId);
        if (vendor && !stageName) {
            setStageName(`Stage for ${vendor.name}`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Assign Vendor</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                        Close
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</label>
                        <select
                            value={vendorId ?? ""}
                            onChange={handleVendorChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="">Select vendor</option>
                            {vendorOptions.map((vendor: Vendor): ReactElement => (
                                <option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stage Name</label>
                        <input
                            type="text"
                            value={stageName}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setStageName(event.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stage Order</label>
                            <input
                                type="number"
                                min={1}
                                value={stageOrder}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => setStageOrder(Number(event.target.value))}
                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                            <select
                                value={status}
                                onChange={(event: ChangeEvent<HTMLSelectElement>): void => setStatus(event.target.value as JobVendorStageStatus)}
                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                                {statusOptions.map((option: JobVendorStageStatus): ReactElement => (
                                    <option key={option} value={option}>
                                        {option.replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progress (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={progress}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => setProgress(Number(event.target.value))}
                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Completion</label>
                            <input
                                type="date"
                                value={expectedCompletion}
                                onChange={(event: ChangeEvent<HTMLInputElement>): void => setExpectedCompletion(event.target.value)}
                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor Cost (KES)</label>
                        <input
                            type="text"
                            value={vendorCost}
                            onChange={(event: ChangeEvent<HTMLInputElement>): void => setVendorCost(event.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
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
                        className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                    >
                        Assign Vendor
                    </button>
                </div>
            </div>
        </div>
    );
}
