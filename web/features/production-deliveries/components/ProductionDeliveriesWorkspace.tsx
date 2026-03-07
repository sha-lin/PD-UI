"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2Icon, LoaderCircleIcon, SearchIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { toast } from "sonner";
import {
    completeProductionHandoff,
    fetchProductionHandoffQueue,
    submitProductionQCForJob,
} from "@/services/production-deliveries";
import type {
    CompleteProductionHandoffPayload,
    PackagingVerification,
    ProductionQCStatus,
    ProductionHandoffQueueItem,
    ProductionHandoffQueueResponse,
    SubmitProductionQCForJobPayload,
} from "@/types/production-deliveries";
import type { StagingLocation } from "@/types/deliveries";

interface HandoffFormState {
    stagingLocation: StagingLocation;
    notesToAm: string;
    packagePhotosInput: string;
    lockedEvp: string;
    actualCost: string;
    markUrgent: boolean;
    notifyAm: boolean;
    notifyViaEmail: boolean;
    packagingVerification: PackagingVerification;
}

interface QCFormState {
    colorAccuracy: boolean;
    printQuality: boolean;
    cuttingAccuracy: boolean;
    finishingQuality: boolean;
    quantityVerified: boolean;
    packagingChecked: boolean;
    notes: string;
    decision: ProductionQCStatus;
}

const DEFAULT_PACKAGING_VERIFICATION: PackagingVerification = {
    boxes_sealed: false,
    job_labels: false,
    quantity_marked: false,
    total_quantity: false,
    fragile_stickers: false,
};

const DEFAULT_FORM_STATE: HandoffFormState = {
    stagingLocation: "shelf-b",
    notesToAm: "",
    packagePhotosInput: "",
    lockedEvp: "",
    actualCost: "",
    markUrgent: false,
    notifyAm: true,
    notifyViaEmail: true,
    packagingVerification: DEFAULT_PACKAGING_VERIFICATION,
};

const DEFAULT_QC_FORM_STATE: QCFormState = {
    colorAccuracy: false,
    printQuality: false,
    cuttingAccuracy: false,
    finishingQuality: false,
    quantityVerified: false,
    packagingChecked: false,
    notes: "",
    decision: "pending",
};

const locationLabels: Record<StagingLocation, string> = {
    "shelf-a": "Shelf A - Urgent/Priority",
    "shelf-b": "Shelf B - Standard/Ready Today",
    "shelf-c": "Shelf C - Future Delivery",
    warehouse: "Warehouse - Overflow",
};

const qcLabel = (status: string | null): string => {
    if (!status) {
        return "Not started";
    }

    if (status === "passed") {
        return "Passed";
    }

    if (status === "failed") {
        return "Failed";
    }

    if (status === "rework") {
        return "Needs Rework";
    }

    return status;
};

const isPackagingChecklistComplete = (verification: PackagingVerification): boolean => {
    return Object.values(verification).every((isChecked: boolean): boolean => isChecked);
};

const getQCBadgeClass = (status: string | null): string => {
    if (status === "passed") {
        return "bg-brand-green/10 text-brand-green border-brand-green/20";
    }

    if (status === "failed") {
        return "bg-brand-red/10 text-brand-red border-brand-red/20";
    }

    if (status === "rework") {
        return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
    }

    return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
};

const getQCDecisionLabel = (decision: ProductionQCStatus): string => {
    if (decision === "passed") {
        return "Pass";
    }

    if (decision === "failed") {
        return "Fail";
    }

    if (decision === "rework") {
        return "Needs Rework";
    }

    return "Pending";
};

const isQCChecklistComplete = (state: QCFormState): boolean => {
    return (
        state.colorAccuracy
        && state.printQuality
        && state.cuttingAccuracy
        && state.finishingQuality
        && state.quantityVerified
        && state.packagingChecked
    );
};

const getInitialQCFormState = (item: ProductionHandoffQueueItem | null): QCFormState => {
    if (!item) {
        return DEFAULT_QC_FORM_STATE;
    }

    const status = item.qc_status;
    const decision: ProductionQCStatus =
        status === "passed" || status === "failed" || status === "rework" || status === "pending"
            ? status
            : "pending";

    return {
        colorAccuracy: item.qc_color_accuracy,
        printQuality: item.qc_print_quality,
        cuttingAccuracy: item.qc_cutting_accuracy,
        finishingQuality: item.qc_finishing_quality,
        quantityVerified: item.qc_quantity_verified,
        packagingChecked: item.qc_packaging_checked,
        notes: item.qc_notes,
        decision,
    };
};

export default function ProductionDeliveriesWorkspace(): ReactElement {
    const [search, setSearch] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [formState, setFormState] = useState<HandoffFormState>(DEFAULT_FORM_STATE);
    const [qcFormState, setQCFormState] = useState<QCFormState>(DEFAULT_QC_FORM_STATE);

    useEffect((): (() => void) => {
        const timer = setTimeout((): void => {
            setDebouncedSearch(search);
        }, 400);

        return (): void => clearTimeout(timer);
    }, [search]);

    const queueQuery = useQuery({
        queryKey: ["production-deliveries", "handoff-queue", debouncedSearch],
        queryFn: (): Promise<ProductionHandoffQueueResponse> => fetchProductionHandoffQueue(debouncedSearch),
    });

    const queueItems = queueQuery.data?.results ?? [];

    useEffect((): void => {
        if (queueItems.length === 0) {
            setSelectedJobId(null);
            return;
        }

        if (selectedJobId === null) {
            setSelectedJobId(queueItems[0].job_id);
            return;
        }

        const stillExists = queueItems.some((item: ProductionHandoffQueueItem): boolean => item.job_id === selectedJobId);
        if (!stillExists) {
            setSelectedJobId(queueItems[0].job_id);
        }
    }, [queueItems, selectedJobId]);

    const selectedJob = useMemo((): ProductionHandoffQueueItem | null => {
        if (selectedJobId === null) {
            return null;
        }

        return queueItems.find((item: ProductionHandoffQueueItem): boolean => item.job_id === selectedJobId) ?? null;
    }, [queueItems, selectedJobId]);

    useEffect((): void => {
        if (!selectedJob) {
            setFormState(DEFAULT_FORM_STATE);
            setQCFormState(DEFAULT_QC_FORM_STATE);
            return;
        }

        setFormState({
            ...DEFAULT_FORM_STATE,
            stagingLocation: selectedJob.existing_staging_location ?? "shelf-b",
            markUrgent: selectedJob.existing_mark_urgent,
        });

        setQCFormState(getInitialQCFormState(selectedJob));
    }, [selectedJob]);

    const qcMutation = useMutation({
        mutationFn: (payload: SubmitProductionQCForJobPayload) => submitProductionQCForJob(payload),
        onSuccess: (response): void => {
            toast.success(response.detail || "QC submitted successfully.");
            void queueQuery.refetch();
        },
        onError: (error: unknown): void => {
            const message = error instanceof Error ? error.message : "Unable to submit QC.";
            toast.error(message);
        },
    });

    const handoffMutation = useMutation({
        mutationFn: (payload: CompleteProductionHandoffPayload) => completeProductionHandoff(payload),
        onSuccess: (response): void => {
            toast.success(response.detail || "Handoff completed successfully.");
            void queueQuery.refetch();
        },
        onError: (error: unknown): void => {
            const message = error instanceof Error ? error.message : "Unable to complete handoff.";
            toast.error(message);
        },
    });

    const handleQCChecklistChange =
        (field: keyof Omit<QCFormState, "notes" | "decision">) =>
            (event: ChangeEvent<HTMLInputElement>): void => {
                setQCFormState((previousState: QCFormState): QCFormState => ({
                    ...previousState,
                    [field]: event.target.checked,
                }));
            };

    const qcChecklistComplete = isQCChecklistComplete(qcFormState);

    const handleSubmitQC = (): void => {
        if (!selectedJob) {
            toast.error("Select a job to submit QC.");
            return;
        }

        if (qcFormState.decision === "pending") {
            toast.error("Select a QC decision before submitting.");
            return;
        }

        if (qcFormState.decision === "passed" && !qcChecklistComplete) {
            toast.error("All QC checklist checks must be complete for pass decision.");
            return;
        }

        if ((qcFormState.decision === "failed" || qcFormState.decision === "rework") && !qcFormState.notes.trim()) {
            toast.error("Notes are required for failed or rework decisions.");
            return;
        }

        const payload: SubmitProductionQCForJobPayload = {
            job_id: selectedJob.job_id,
            status: qcFormState.decision,
            notes: qcFormState.notes.trim(),
            color_accuracy: qcFormState.colorAccuracy,
            print_quality: qcFormState.printQuality,
            cutting_accuracy: qcFormState.cuttingAccuracy,
            finishing_quality: qcFormState.finishingQuality,
            quantity_verified: qcFormState.quantityVerified,
            packaging_checked: qcFormState.packagingChecked,
        };

        qcMutation.mutate(payload);
    };

    const handlePackagingChange = (key: keyof PackagingVerification) =>
        (event: ChangeEvent<HTMLInputElement>): void => {
            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                ...previousState,
                packagingVerification: {
                    ...previousState.packagingVerification,
                    [key]: event.target.checked,
                },
            }));
        };

    const isFormComplete = isPackagingChecklistComplete(formState.packagingVerification);

    const handleSubmit = (): void => {
        if (!selectedJob) {
            toast.error("Select a job to hand over.");
            return;
        }

        if (!selectedJob.is_ready_for_handoff) {
            toast.error("QC must be passed before handoff.");
            return;
        }

        if (!isFormComplete) {
            toast.error("Complete all packaging verification checks.");
            return;
        }

        const packagePhotoUrls = formState.packagePhotosInput
            .split("\n")
            .map((value: string): string => value.trim())
            .filter((value: string): boolean => value.length > 0);

        const payload: CompleteProductionHandoffPayload = {
            job_id: selectedJob.job_id,
            staging_location: formState.stagingLocation,
            packaging_verified: formState.packagingVerification,
            package_photos: packagePhotoUrls,
            notes_to_am: formState.notesToAm.trim(),
            locked_evp: formState.lockedEvp.trim() || undefined,
            actual_cost: formState.actualCost.trim() || undefined,
            mark_urgent: formState.markUrgent,
            notify_am: formState.notifyAm,
            notify_via_email: formState.notifyViaEmail,
        };

        handoffMutation.mutate(payload);
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Link href="/production-team" className="hover:text-brand-blue">
                            Production Team
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">Delivery Handover</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Delivery Handover</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Complete production-side handoff to Account Management for dispatch.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
                {queueQuery.isLoading ? (
                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                        <div className="h-5 w-56 rounded bg-gray-200" />
                        <div className="mt-3 h-4 w-96 rounded bg-gray-200" />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-20 rounded bg-gray-100" />
                            <div className="h-20 rounded bg-gray-100" />
                            <div className="h-20 rounded bg-gray-100" />
                        </div>
                    </section>
                ) : null}

                {!queueQuery.isLoading && queueQuery.isError ? (
                    <section className="rounded-lg border border-brand-red/20 bg-brand-red/10 p-6">
                        <div className="flex items-center gap-3">
                            <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                            <div>
                                <h2 className="text-lg font-semibold text-brand-red">Unable to load handoff queue</h2>
                                <p className="text-sm text-gray-700 mt-1">Refresh the page and try again.</p>
                            </div>
                        </div>
                    </section>
                ) : null}

                {!queueQuery.isLoading && !queueQuery.isError ? (
                    <>
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Queue Total</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">{queueQuery.data?.count ?? 0}</p>
                            </article>
                            <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ready for Handoff</p>
                                <p className="mt-2 text-2xl font-bold text-brand-green">{queueQuery.data?.ready_count ?? 0}</p>
                            </article>
                            <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Blocked (QC)</p>
                                <p className="mt-2 text-2xl font-bold text-brand-orange">{queueQuery.data?.blocked_count ?? 0}</p>
                            </article>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event: ChangeEvent<HTMLInputElement>): void => setSearch(event.target.value)}
                                    placeholder="Search by job number, client, job name, or product"
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-brand-blue focus:outline-none"
                                />
                            </div>
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <article className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-gray-200 px-4 py-3">
                                    <h2 className="text-lg font-semibold text-gray-900">My Handover Queue</h2>
                                </div>
                                <div className="max-h-[520px] overflow-auto">
                                    {queueItems.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <TruckIcon className="h-10 w-10 mx-auto text-gray-300" />
                                            <p className="mt-3 text-sm text-gray-600">No jobs waiting for handoff.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">QC</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {queueItems.map((item: ProductionHandoffQueueItem): ReactElement => {
                                                    const isSelected = item.job_id === selectedJobId;
                                                    return (
                                                        <tr key={item.job_id} className={`border-t border-gray-100 ${isSelected ? "bg-brand-blue/5" : ""}`}>
                                                            <td className="px-4 py-3 align-top">
                                                                <p className="text-sm font-semibold text-gray-900">{item.job_number || `#${item.job_id}`}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{item.product}</p>
                                                            </td>
                                                            <td className="px-4 py-3 align-top">
                                                                <p className="text-sm text-gray-700">{item.client_name || "—"}</p>
                                                            </td>
                                                            <td className="px-4 py-3 align-top">
                                                                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getQCBadgeClass(item.qc_status)}`}>
                                                                    {qcLabel(item.qc_status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right align-top">
                                                                <button
                                                                    type="button"
                                                                    onClick={(): void => setSelectedJobId(item.job_id)}
                                                                    className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                                                                >
                                                                    {isSelected ? "Selected" : "Start Handover"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </article>

                            <div className="space-y-6">
                                <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900">Step 1: Quality Control</h2>
                                        {selectedJob ? (
                                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getQCBadgeClass(selectedJob.qc_status)}`}>
                                                {qcLabel(selectedJob.qc_status)}
                                            </span>
                                        ) : null}
                                    </div>

                                    {!selectedJob ? (
                                        <p className="mt-4 text-sm text-gray-600">Select a job from queue to start QC and handover.</p>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.colorAccuracy}
                                                        onChange={handleQCChecklistChange("colorAccuracy")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Color accuracy verified
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.printQuality}
                                                        onChange={handleQCChecklistChange("printQuality")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Print quality verified
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.cuttingAccuracy}
                                                        onChange={handleQCChecklistChange("cuttingAccuracy")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Cutting accuracy verified
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.finishingQuality}
                                                        onChange={handleQCChecklistChange("finishingQuality")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Finishing quality verified
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.quantityVerified}
                                                        onChange={handleQCChecklistChange("quantityVerified")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Quantity verified
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={qcFormState.packagingChecked}
                                                        onChange={handleQCChecklistChange("packagingChecked")}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Packaging checked
                                                </label>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">QC Decision</label>
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    {(["passed", "rework", "failed"] as ProductionQCStatus[]).map((decision: ProductionQCStatus): ReactElement => {
                                                        const active = qcFormState.decision === decision;
                                                        return (
                                                            <button
                                                                key={decision}
                                                                type="button"
                                                                onClick={(): void => {
                                                                    setQCFormState((previousState: QCFormState): QCFormState => ({
                                                                        ...previousState,
                                                                        decision,
                                                                    }));
                                                                }}
                                                                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${active
                                                                    ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                                                                    : "border-gray-300 text-gray-700"
                                                                    }`}
                                                            >
                                                                {getQCDecisionLabel(decision)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">QC Notes</label>
                                                <textarea
                                                    value={qcFormState.notes}
                                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                                                        setQCFormState((previousState: QCFormState): QCFormState => ({
                                                            ...previousState,
                                                            notes: event.target.value,
                                                        }));
                                                    }}
                                                    rows={3}
                                                    placeholder="Record quality findings and instructions"
                                                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs text-gray-500">
                                                    Pass requires all checklist checks complete. Rework/Fail requires notes.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleSubmitQC}
                                                    disabled={qcMutation.isPending}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue disabled:opacity-60"
                                                >
                                                    {qcMutation.isPending ? (
                                                        <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <ShieldCheckIcon className="h-4 w-4" />
                                                    )}
                                                    Submit QC Decision
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>

                                <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900">Step 2: Delivery Handover</h2>
                                        {selectedJob ? (
                                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {selectedJob.job_number || `#${selectedJob.job_id}`}
                                            </span>
                                        ) : null}
                                    </div>

                                    {!selectedJob ? (
                                        <p className="mt-4 text-sm text-gray-600">Select a job from queue to begin handover.</p>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            {!selectedJob.is_ready_for_handoff ? (
                                                <div className="rounded-md border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-sm text-brand-black">
                                                    Handover is locked until QC status is Passed.
                                                </div>
                                            ) : null}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Staging Location</label>
                                                    <select
                                                        value={formState.stagingLocation}
                                                        onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                                            const value = event.target.value as StagingLocation;
                                                            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                ...previousState,
                                                                stagingLocation: value,
                                                            }));
                                                        }}
                                                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    >
                                                        <option value="shelf-a">{locationLabels["shelf-a"]}</option>
                                                        <option value="shelf-b">{locationLabels["shelf-b"]}</option>
                                                        <option value="shelf-c">{locationLabels["shelf-c"]}</option>
                                                        <option value="warehouse">{locationLabels.warehouse}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Urgency</label>
                                                    <label className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={formState.markUrgent}
                                                            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                                setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                    ...previousState,
                                                                    markUrgent: event.target.checked,
                                                                }));
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                        Mark as urgent for AM
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-gray-200 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Packaging Verification</p>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input type="checkbox" checked={formState.packagingVerification.boxes_sealed} onChange={handlePackagingChange("boxes_sealed")} className="h-4 w-4 rounded border-gray-300" />
                                                        All boxes sealed
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input type="checkbox" checked={formState.packagingVerification.job_labels} onChange={handlePackagingChange("job_labels")} className="h-4 w-4 rounded border-gray-300" />
                                                        Job labels on every package
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input type="checkbox" checked={formState.packagingVerification.quantity_marked} onChange={handlePackagingChange("quantity_marked")} className="h-4 w-4 rounded border-gray-300" />
                                                        Quantity marked per package
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input type="checkbox" checked={formState.packagingVerification.total_quantity} onChange={handlePackagingChange("total_quantity")} className="h-4 w-4 rounded border-gray-300" />
                                                        Total quantity confirmed
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                                        <input type="checkbox" checked={formState.packagingVerification.fragile_stickers} onChange={handlePackagingChange("fragile_stickers")} className="h-4 w-4 rounded border-gray-300" />
                                                        Fragile stickers applied
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes to AM</label>
                                                <textarea
                                                    value={formState.notesToAm}
                                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                                                        setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                            ...previousState,
                                                            notesToAm: event.target.value,
                                                        }));
                                                    }}
                                                    rows={3}
                                                    placeholder="Pickup instructions, cautions, and final production notes"
                                                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Package Photo URLs</label>
                                                <textarea
                                                    value={formState.packagePhotosInput}
                                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                                                        setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                            ...previousState,
                                                            packagePhotosInput: event.target.value,
                                                        }));
                                                    }}
                                                    rows={3}
                                                    placeholder="One URL per line"
                                                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Locked EVP</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formState.lockedEvp}
                                                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                ...previousState,
                                                                lockedEvp: event.target.value,
                                                            }));
                                                        }}
                                                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actual Cost</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formState.actualCost}
                                                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                ...previousState,
                                                                actualCost: event.target.value,
                                                            }));
                                                        }}
                                                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={formState.notifyAm}
                                                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                ...previousState,
                                                                notifyAm: event.target.checked,
                                                            }));
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Notify Account Manager
                                                </label>
                                                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={formState.notifyViaEmail}
                                                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                                                            setFormState((previousState: HandoffFormState): HandoffFormState => ({
                                                                ...previousState,
                                                                notifyViaEmail: event.target.checked,
                                                            }));
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Notify via email
                                                </label>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between gap-3">
                                                <Link href="/staff/jobs" className="text-sm font-medium text-brand-blue hover:underline">
                                                    Open Jobs Board
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={handoffMutation.isPending || !selectedJob.is_ready_for_handoff || !isFormComplete}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                                >
                                                    {handoffMutation.isPending ? (
                                                        <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2Icon className="h-4 w-4" />
                                                    )}
                                                    Complete Handover
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </main>
    );
}
