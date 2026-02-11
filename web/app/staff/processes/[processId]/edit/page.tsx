"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import ProcessForm from "@/features/processes/components/ProcessForm";
import {
    createProcessTier,
    createProcessVariable,
    createProcessVendor,
    deleteProcessTier,
    deleteProcessVariable,
    deleteProcessVendor,
    fetchProcessDetailBundle,
    updateProcess,
    updateProcessTier,
    updateProcessVariable,
    updateProcessVendor,
} from "@/services/processes";
import {
    CreateProcessTierPayload,
    CreateProcessVariablePayload,
    CreateProcessVendorPayload,
    Process,
    ProcessFormValues,
    ProcessTier,
    ProcessTierFormValues,
    ProcessVariable,
    ProcessVariableFormValues,
    ProcessVendor,
    ProcessVendorFormValues,
    ProcessDetailBundle,
    UpdateProcessPayload,
    UpdateProcessTierPayload,
    UpdateProcessVariablePayload,
    UpdateProcessVendorPayload,
} from "@/types/processes";

const buildFormValuesFromData = (
    process: Process,
    tiers: ProcessTier[],
    variables: ProcessVariable[],
    vendors: ProcessVendor[]
): ProcessFormValues => {
    return {
        process_id: process.process_id,
        process_name: process.process_name,
        description: process.description ?? "",
        category: process.category,
        standard_lead_time: process.standard_lead_time,
        pricing_type: process.pricing_type,
        unit_of_measure: process.unit_of_measure ?? "",
        base_cost: process.base_cost,
        approval_type: process.approval_type ?? "auto_approve",
        approval_margin_threshold: process.approval_margin_threshold ?? "25.00",
        status: process.status,
        tiers: tiers.map((tier: ProcessTier): ProcessTierFormValues => ({
            id: tier.id,
            tier_number: tier.tier_number,
            quantity_from: tier.quantity_from,
            quantity_to: tier.quantity_to,
            price: tier.price,
            cost: tier.cost,
        })),
        variables: variables.map((variable: ProcessVariable): ProcessVariableFormValues => ({
            id: variable.id,
            variable_name: variable.variable_name,
            variable_type: variable.variable_type,
            unit: variable.unit ?? "",
            variable_value: variable.variable_value,
            price: variable.price,
            rate: variable.rate,
            min_value: variable.min_value,
            max_value: variable.max_value,
            default_value: variable.default_value,
            description: variable.description ?? "",
            order: variable.order,
        })),
        vendors: vendors.map((vendor: ProcessVendor): ProcessVendorFormValues => ({
            id: vendor.id,
            vendor_name: vendor.vendor_name,
            vendor_id: vendor.vendor_id,
            vps_score: vendor.vps_score,
            priority: vendor.priority,
            rush_enabled: vendor.rush_enabled,
            rush_fee_percentage: vendor.rush_fee_percentage,
            rush_threshold_days: vendor.rush_threshold_days,
            minimum_order: vendor.minimum_order,
            standard_lead_time: vendor.standard_lead_time,
            rush_lead_time: vendor.rush_lead_time,
            notes: vendor.notes ?? "",
        })),
    };
};

export default function EditProcessPage(): ReactElement {
    const router = useRouter();
    const params = useParams();
    const processIdParam =
        typeof params.processId === "string"
            ? params.processId
            : Array.isArray(params.processId)
                ? params.processId[0]
                : "";
    const processId = useMemo((): number => Number(processIdParam), [processIdParam]);
    const hasValidId = Number.isFinite(processId);

    const { data, isLoading, error } = useQuery({
        queryKey: ["process-detail", processId],
        queryFn: (): Promise<ProcessDetailBundle> => fetchProcessDetailBundle(processId),
        enabled: hasValidId,
    });

    const [values, setValues] = useState<ProcessFormValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect((): void => {
        if (data && !values) {
            setValues(buildFormValuesFromData(data.process, data.tiers, data.variables, data.vendors));
        }
    }, [data, values]);

    const buildProcessPayload = (formValues: ProcessFormValues): UpdateProcessPayload => {
        return {
            process_id: formValues.process_id.trim(),
            process_name: formValues.process_name.trim(),
            description: formValues.description.trim(),
            category: formValues.category,
            standard_lead_time: formValues.standard_lead_time,
            pricing_type: formValues.pricing_type,
            unit_of_measure: formValues.unit_of_measure.trim() || null,
            base_cost: formValues.base_cost || "0.00",
            approval_type: formValues.approval_type.trim() || "auto_approve",
            approval_margin_threshold: formValues.approval_margin_threshold || "25.00",
            status: formValues.status,
        };
    };

    const syncTiers = async (
        processIdValue: number,
        current: ProcessTierFormValues[],
        existing: ProcessTier[]
    ): Promise<void> => {
        const currentIds = current
            .map((tier: ProcessTierFormValues): number | null => tier.id)
            .filter((tierId: number | null): tierId is number => tierId !== null);
        const deleteTargets = existing.filter((tier: ProcessTier): boolean => !currentIds.includes(tier.id));

        await Promise.all(deleteTargets.map((tier: ProcessTier): Promise<void> => deleteProcessTier(tier.id)));

        await Promise.all(
            current.map((tier: ProcessTierFormValues): Promise<unknown> => {
                const payload: CreateProcessTierPayload = {
                    process: processIdValue,
                    tier_number: tier.tier_number,
                    quantity_from: tier.quantity_from,
                    quantity_to: tier.quantity_to,
                    price: tier.price,
                    cost: tier.cost,
                };

                if (tier.id) {
                    const updatePayload: UpdateProcessTierPayload = payload;
                    return updateProcessTier(tier.id, updatePayload);
                }

                return createProcessTier(payload);
            })
        );
    };

    const syncVariables = async (
        processIdValue: number,
        current: ProcessVariableFormValues[],
        existing: ProcessVariable[]
    ): Promise<void> => {
        const currentIds = current
            .map((variable: ProcessVariableFormValues): number | null => variable.id)
            .filter((variableId: number | null): variableId is number => variableId !== null);
        const deleteTargets = existing.filter(
            (variable: ProcessVariable): boolean => !currentIds.includes(variable.id)
        );

        await Promise.all(
            deleteTargets.map((variable: ProcessVariable): Promise<void> => deleteProcessVariable(variable.id))
        );

        await Promise.all(
            current.map((variable: ProcessVariableFormValues): Promise<unknown> => {
                const payload: CreateProcessVariablePayload = {
                    process: processIdValue,
                    variable_name: variable.variable_name.trim(),
                    variable_type: variable.variable_type,
                    unit: variable.unit.trim(),
                    variable_value: variable.variable_value,
                    price: variable.price,
                    rate: variable.rate,
                    min_value: variable.min_value,
                    max_value: variable.max_value,
                    default_value: variable.default_value,
                    description: variable.description.trim(),
                    order: variable.order,
                };

                if (variable.id) {
                    const updatePayload: UpdateProcessVariablePayload = payload;
                    return updateProcessVariable(variable.id, updatePayload);
                }

                return createProcessVariable(payload);
            })
        );
    };

    const syncVendors = async (
        processIdValue: number,
        current: ProcessVendorFormValues[],
        existing: ProcessVendor[]
    ): Promise<void> => {
        const currentIds = current
            .map((vendor: ProcessVendorFormValues): number | null => vendor.id)
            .filter((vendorId: number | null): vendorId is number => vendorId !== null);
        const deleteTargets = existing.filter((vendor: ProcessVendor): boolean => !currentIds.includes(vendor.id));

        await Promise.all(deleteTargets.map((vendor: ProcessVendor): Promise<void> => deleteProcessVendor(vendor.id)));

        await Promise.all(
            current.map((vendor: ProcessVendorFormValues): Promise<unknown> => {
                const payload: CreateProcessVendorPayload = {
                    process: processIdValue,
                    vendor_name: vendor.vendor_name.trim(),
                    vendor_id: vendor.vendor_id.trim(),
                    vps_score: vendor.vps_score || "0",
                    priority: vendor.priority,
                    tier_costs: null,
                    formula_rates: null,
                    rush_enabled: vendor.rush_enabled,
                    rush_fee_percentage: vendor.rush_fee_percentage || "0",
                    rush_threshold_days: vendor.rush_threshold_days,
                    minimum_order: vendor.minimum_order || "0",
                    standard_lead_time: vendor.standard_lead_time,
                    rush_lead_time: vendor.rush_lead_time,
                    notes: vendor.notes.trim(),
                };

                if (vendor.id) {
                    const updatePayload: UpdateProcessVendorPayload = payload;
                    return updateProcessVendor(vendor.id, updatePayload);
                }

                return createProcessVendor(payload);
            })
        );
    };

    const handleSubmit = async (): Promise<void> => {
        if (!values || !data) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const processPayload = buildProcessPayload(values);
            await updateProcess(data.process.id, processPayload);

            if (values.pricing_type === "tier") {
                await syncTiers(data.process.id, values.tiers, data.tiers);
                await Promise.all(
                    data.variables.map((variable: ProcessVariable): Promise<void> => deleteProcessVariable(variable.id))
                );
            }

            if (values.pricing_type === "formula") {
                await syncVariables(data.process.id, values.variables, data.variables);
                await Promise.all(
                    data.tiers.map((tier: ProcessTier): Promise<void> => deleteProcessTier(tier.id))
                );
            }

            if (values.category === "outsourced") {
                await syncVendors(data.process.id, values.vendors, data.vendors);
            } else {
                await Promise.all(data.vendors.map((vendor: ProcessVendor): Promise<void> => deleteProcessVendor(vendor.id)));
            }

            router.push(`/staff/processes/${data.process.id}`);
        } catch (error: unknown) {
            setErrorMessage("Unable to update the process. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        if (data?.process) {
            router.push(`/staff/processes/${data.process.id}`);
            return;
        }
        router.push("/staff/processes");
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
                        <span className="text-gray-900">Edit</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Process</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update pricing rules, vendors, and variables
                    </p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[1, 2, 3, 4].map((item: number): ReactElement => (
                                    <div key={item} className="h-20 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLoading && (error || !data) && hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load process</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch process details. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-5 w-5 text-brand-red" />
                                <p className="text-sm text-brand-red">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {values && data && (
                        <ProcessForm
                            values={values}
                            onValuesChange={setValues}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            submitLabel="Save Changes"
                            isSubmitting={isSubmitting}
                            isEdit={true}
                        />
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
