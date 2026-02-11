"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import ProcessForm from "@/features/processes/components/ProcessForm";
import {
    createProcess,
    createProcessTier,
    createProcessVariable,
    createProcessVendor,
} from "@/services/processes";
import {
    CreateProcessPayload,
    CreateProcessTierPayload,
    CreateProcessVariablePayload,
    CreateProcessVendorPayload,
    ProcessFormValues,
    ProcessTierFormValues,
    ProcessVariableFormValues,
    ProcessVendorFormValues,
} from "@/types/processes";

const buildInitialValues = (): ProcessFormValues => {
    return {
        process_id: "",
        process_name: "",
        description: "",
        category: "outsourced",
        standard_lead_time: 5,
        pricing_type: "tier",
        unit_of_measure: "",
        base_cost: "0.00",
        approval_type: "auto_approve",
        approval_margin_threshold: "25.00",
        status: "draft",
        tiers: [
            {
                id: null,
                tier_number: 1,
                quantity_from: 1,
                quantity_to: 1,
                price: "0.00",
                cost: "0.00",
            },
        ],
        variables: [],
        vendors: [],
    };
};

export default function NewProcessPage(): ReactElement {
    const router = useRouter();
    const [values, setValues] = useState<ProcessFormValues>(buildInitialValues());
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const buildProcessPayload = (formValues: ProcessFormValues): CreateProcessPayload => {
        return {
            process_id: formValues.process_id.trim() || "",
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

    const buildTierPayloads = (processId: number, tiers: ProcessTierFormValues[]): CreateProcessTierPayload[] => {
        return tiers
            .filter((tier: ProcessTierFormValues): boolean => Boolean(tier.quantity_from) && Boolean(tier.quantity_to))
            .map((tier: ProcessTierFormValues): CreateProcessTierPayload => ({
                process: processId,
                tier_number: tier.tier_number,
                quantity_from: tier.quantity_from,
                quantity_to: tier.quantity_to,
                price: tier.price,
                cost: tier.cost,
            }));
    };

    const buildVariablePayloads = (
        processId: number,
        variables: ProcessVariableFormValues[]
    ): CreateProcessVariablePayload[] => {
        return variables
            .filter((variable: ProcessVariableFormValues): boolean => Boolean(variable.variable_name.trim()))
            .map((variable: ProcessVariableFormValues): CreateProcessVariablePayload => ({
                process: processId,
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
            }));
    };

    const buildVendorPayloads = (
        processId: number,
        vendors: ProcessVendorFormValues[]
    ): CreateProcessVendorPayload[] => {
        return vendors
            .filter((vendor: ProcessVendorFormValues): boolean => Boolean(vendor.vendor_name.trim()))
            .map((vendor: ProcessVendorFormValues): CreateProcessVendorPayload => ({
                process: processId,
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
            }));
    };

    const handleSubmit = async (): Promise<void> => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const processPayload = buildProcessPayload(values);
            const createdProcess = await createProcess(processPayload);

            if (values.pricing_type === "tier") {
                const tierPayloads = buildTierPayloads(createdProcess.id, values.tiers);
                await Promise.all(
                    tierPayloads.map((payload: CreateProcessTierPayload): Promise<unknown> =>
                        createProcessTier(payload)
                    )
                );
            }

            if (values.pricing_type === "formula") {
                const variablePayloads = buildVariablePayloads(createdProcess.id, values.variables);
                await Promise.all(
                    variablePayloads.map((payload: CreateProcessVariablePayload): Promise<unknown> =>
                        createProcessVariable(payload)
                    )
                );
            }

            if (values.category === "outsourced") {
                const vendorPayloads = buildVendorPayloads(createdProcess.id, values.vendors);
                await Promise.all(
                    vendorPayloads.map((payload: CreateProcessVendorPayload): Promise<unknown> =>
                        createProcessVendor(payload)
                    )
                );
            }

            router.push(`/staff/processes/${createdProcess.id}`);
        } catch (error: unknown) {
            setErrorMessage("Unable to save the process. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
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
                        <span className="text-gray-900">New</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Process</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Set up pricing rules, variables, and vendor routing
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
                    {errorMessage && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-5 w-5 text-brand-red" />
                                <p className="text-sm text-brand-red">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <ProcessForm
                        values={values}
                        onValuesChange={setValues}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        submitLabel="Create Process"
                        isSubmitting={isSubmitting}
                        isEdit={false}
                    />
                </div>
            </main>
        </AdminLayout>
    );
}
