"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import {
    createProcessVariableRange,
    deleteProcessVariableRange,
    fetchProcess,
    fetchProcessVariableRanges,
    fetchProcessVariables,
} from "@/services/processes";
import { Process, ProcessVariable, ProcessVariableRange } from "@/types/processes";

interface VariableWithRanges {
    variable: ProcessVariable;
    ranges: ProcessVariableRange[];
}

interface VariableRangesBundle {
    process: Process;
    items: VariableWithRanges[];
}

interface RangeDraft {
    min_value: string;
    max_value: string;
    price: string;
    rate: string;
    order: string;
}

const buildDefaultDraft = (): RangeDraft => {
    return {
        min_value: "0",
        max_value: "0",
        price: "0.00",
        rate: "1.0",
        order: "1",
    };
};

export default function ProcessVariableRangesPage(): ReactElement {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const processIdParam =
        typeof params.processId === "string"
            ? params.processId
            : Array.isArray(params.processId)
                ? params.processId[0]
                : "";
    const processId = useMemo((): number => Number(processIdParam), [processIdParam]);
    const hasValidId = Number.isFinite(processId);
    const [drafts, setDrafts] = useState<Record<number, RangeDraft>>({});

    const fetchBundle = async (): Promise<VariableRangesBundle> => {
        const [process, variables] = await Promise.all([
            fetchProcess(processId),
            fetchProcessVariables(processId),
        ]);

        const rangesByVariable = await Promise.all(
            variables.map(async (variable: ProcessVariable): Promise<VariableWithRanges> => {
                const ranges = await fetchProcessVariableRanges(variable.id);
                return { variable, ranges };
            })
        );

        return {
            process,
            items: rangesByVariable,
        };
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["process-variable-ranges", processId],
        queryFn: fetchBundle,
        enabled: hasValidId,
    });

    const createMutation = useMutation({
        mutationFn: (payload: { variableId: number; draft: RangeDraft }): Promise<ProcessVariableRange> => {
            const orderValue = Number(payload.draft.order || "0");
            return createProcessVariableRange({
                variable: payload.variableId,
                min_value: payload.draft.min_value,
                max_value: payload.draft.max_value,
                price: payload.draft.price,
                rate: payload.draft.rate,
                order: Number.isNaN(orderValue) ? 0 : orderValue,
            });
        },
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ["process-variable-ranges", processId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (rangeId: number): Promise<void> => deleteProcessVariableRange(rangeId),
        onSuccess: (): void => {
            queryClient.invalidateQueries({ queryKey: ["process-variable-ranges", processId] });
        },
    });

    const handleDraftChange = (variableId: number, field: keyof RangeDraft, value: string): void => {
        const currentDraft = drafts[variableId] ?? buildDefaultDraft();
        setDrafts({
            ...drafts,
            [variableId]: {
                ...currentDraft,
                [field]: value,
            },
        });
    };

    const handleAddRange = (variableId: number): void => {
        const draft = drafts[variableId] ?? buildDefaultDraft();
        createMutation.mutate({ variableId, draft });
        setDrafts({
            ...drafts,
            [variableId]: buildDefaultDraft(),
        });
    };

    const handleDeleteRange = (rangeId: number): void => {
        const confirmDelete = window.confirm("Delete this range?");
        if (!confirmDelete) {
            return;
        }
        deleteMutation.mutate(rangeId);
    };

    return (
        <AdminLayout>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <a href="/staff" className="hover:text-brand-blue">
                            Staff Portal
                        </a>
                        <span>/</span>
                        <a href="/staff/processes" className="hover:text-brand-blue">
                            Processes
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Variable Ranges</span>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Variable Ranges</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                {data?.process.process_name || "Formula-based pricing setup"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(): void => router.push(`/staff/processes/${processId}`)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back
                        </button>
                    </div>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
                    {!hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Invalid process ID</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        The requested process could not be found.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && hasValidId && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-72 mt-3"></div>
                        </div>
                    )}

                    {!isLoading && (error || !data) && hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load ranges</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch variable ranges. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && data && (
                        <div className="space-y-6">
                            {data.items.length === 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-sm text-gray-600">
                                    This process has no variables configured.
                                </div>
                            )}
                            {data.items.map((item: VariableWithRanges): ReactElement => (
                                <div key={item.variable.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">{item.variable.variable_name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.variable.variable_type === "number" ? "Numeric" : "Alphanumeric"}
                                                {item.variable.unit ? ` · ${item.variable.unit}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Min</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Max</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Rate</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Order</th>
                                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {item.ranges.length > 0 ? (
                                                    item.ranges.map((range: ProcessVariableRange): ReactElement => (
                                                        <tr key={range.id}>
                                                            <td className="px-3 py-2 text-gray-900">{range.min_value}</td>
                                                            <td className="px-3 py-2 text-gray-900">{range.max_value}</td>
                                                            <td className="px-3 py-2 text-gray-900">{range.price}</td>
                                                            <td className="px-3 py-2 text-gray-900">{range.rate}</td>
                                                            <td className="px-3 py-2 text-gray-900">{range.order}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={(): void => handleDeleteRange(range.id)}
                                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                                                >
                                                                    <Trash2Icon className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                                                            No ranges defined yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <div className="text-sm font-semibold text-gray-900">Add Range</div>
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3">
                                            <input
                                                type="text"
                                                value={(drafts[item.variable.id] ?? buildDefaultDraft()).min_value}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleDraftChange(item.variable.id, "min_value", event.target.value)
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Min"
                                            />
                                            <input
                                                type="text"
                                                value={(drafts[item.variable.id] ?? buildDefaultDraft()).max_value}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleDraftChange(item.variable.id, "max_value", event.target.value)
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Max"
                                            />
                                            <input
                                                type="text"
                                                value={(drafts[item.variable.id] ?? buildDefaultDraft()).price}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleDraftChange(item.variable.id, "price", event.target.value)
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Price"
                                            />
                                            <input
                                                type="text"
                                                value={(drafts[item.variable.id] ?? buildDefaultDraft()).rate}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleDraftChange(item.variable.id, "rate", event.target.value)
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Rate"
                                            />
                                            <input
                                                type="text"
                                                value={(drafts[item.variable.id] ?? buildDefaultDraft()).order}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleDraftChange(item.variable.id, "order", event.target.value)
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                placeholder="Order"
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={(): void => handleAddRange(item.variable.id)}
                                                className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Add Range
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
