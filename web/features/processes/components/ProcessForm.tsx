import type { ChangeEvent, FormEvent, ReactElement } from "react";
import {
    ProcessFormValues,
    ProcessTierFormValues,
    ProcessVariableFormValues,
    ProcessVendorFormValues,
    ProcessVariableType,
    ProcessVendorPriority,
} from "@/types/processes";

interface ProcessFormProps {
    values: ProcessFormValues;
    onValuesChange: (values: ProcessFormValues) => void;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
    isEdit: boolean;
}

export default function ProcessForm({
    values,
    onValuesChange,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
    isEdit,
}: ProcessFormProps): ReactElement {
    const generateProcessIdFromName = (name: string): string => {
        const words = name
            .trim()
            .toUpperCase()
            .split(/\s+/)
            .filter((value: string): boolean => Boolean(value));

        if (words.length === 0) {
            return "";
        }

        if (words.length >= 2) {
            return `PR-${words[0].slice(0, 3)}-${words[1].slice(0, 3)}`;
        }

        return `PR-${words[0].slice(0, 6)}`;
    };

    const updateValues = (nextValues: ProcessFormValues): void => {
        onValuesChange(nextValues);
    };

    const updateField = <K extends keyof ProcessFormValues>(field: K, value: ProcessFormValues[K]): void => {
        updateValues({
            ...values,
            [field]: value,
        });
    };

    const handleProcessNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const nextName = event.target.value;
        const nextValues = {
            ...values,
            process_name: nextName,
        };

        if (!isEdit) {
            nextValues.process_id = generateProcessIdFromName(nextName);
        }

        updateValues(nextValues);
    };

    const handleProcessIdChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("process_id", event.target.value.toUpperCase());
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        updateField("description", event.target.value);
    };

    const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        updateField("category", event.target.value as ProcessFormValues["category"]);
    };

    const handlePricingTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        updateField("pricing_type", event.target.value as ProcessFormValues["pricing_type"]);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        updateField("status", event.target.value as ProcessFormValues["status"]);
    };

    const handleLeadTimeChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("standard_lead_time", Number(event.target.value));
    };

    const handleUnitChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("unit_of_measure", event.target.value);
    };

    const handleBaseCostChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("base_cost", event.target.value);
    };

    const handleApprovalTypeChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("approval_type", event.target.value);
    };

    const handleApprovalThresholdChange = (event: ChangeEvent<HTMLInputElement>): void => {
        updateField("approval_margin_threshold", event.target.value);
    };

    const handleTierChange = <K extends keyof ProcessTierFormValues>(
        index: number,
        field: K,
        value: ProcessTierFormValues[K]
    ): void => {
        const nextTiers = values.tiers.map((tier: ProcessTierFormValues, tierIndex: number): ProcessTierFormValues => {
            if (tierIndex !== index) {
                return tier;
            }
            return {
                ...tier,
                [field]: value,
            };
        });
        updateField("tiers", nextTiers);
    };

    const addTier = (): void => {
        const nextTiers = [
            ...values.tiers,
            {
                id: null,
                tier_number: values.tiers.length + 1,
                quantity_from: 1,
                quantity_to: 1,
                price: "0.00",
                cost: "0.00",
            },
        ];
        updateField("tiers", nextTiers);
    };

    const removeTier = (index: number): void => {
        const nextTiers = values.tiers.filter((tier: ProcessTierFormValues, tierIndex: number): boolean => tierIndex !== index);
        updateField("tiers", nextTiers);
    };

    const handleVariableChange = <K extends keyof ProcessVariableFormValues>(
        index: number,
        field: K,
        value: ProcessVariableFormValues[K]
    ): void => {
        const nextVariables = values.variables.map(
            (variable: ProcessVariableFormValues, variableIndex: number): ProcessVariableFormValues => {
                if (variableIndex !== index) {
                    return variable;
                }
                return {
                    ...variable,
                    [field]: value,
                };
            }
        );
        updateField("variables", nextVariables);
    };

    const addVariable = (): void => {
        const newVariable: ProcessVariableFormValues = {
            id: null,
            variable_name: "",
            variable_type: "number",
            unit: "",
            variable_value: null,
            price: "0.00",
            rate: "1.0",
            min_value: null,
            max_value: null,
            default_value: null,
            description: "",
            order: values.variables.length + 1,
        };
        const nextVariables = [...values.variables, newVariable];
        updateField("variables", nextVariables);
    };

    const removeVariable = (index: number): void => {
        const nextVariables = values.variables.filter(
            (variable: ProcessVariableFormValues, variableIndex: number): boolean => variableIndex !== index
        );
        updateField("variables", nextVariables);
    };

    const handleVendorChange = <K extends keyof ProcessVendorFormValues>(
        index: number,
        field: K,
        value: ProcessVendorFormValues[K]
    ): void => {
        const nextVendors = values.vendors.map(
            (vendor: ProcessVendorFormValues, vendorIndex: number): ProcessVendorFormValues => {
                if (vendorIndex !== index) {
                    return vendor;
                }
                return {
                    ...vendor,
                    [field]: value,
                };
            }
        );
        updateField("vendors", nextVendors);
    };

    const addVendor = (): void => {
        const newVendor: ProcessVendorFormValues = {
            id: null,
            vendor_name: "",
            vendor_id: "",
            vps_score: "0",
            priority: "alternative",
            rush_enabled: false,
            rush_fee_percentage: "0",
            rush_threshold_days: 3,
            minimum_order: "0",
            standard_lead_time: 5,
            rush_lead_time: null,
            notes: "",
        };
        const nextVendors = [...values.vendors, newVendor];
        updateField("vendors", nextVendors);
    };

    const removeVendor = (index: number): void => {
        const nextVendors = values.vendors.filter(
            (vendor: ProcessVendorFormValues, vendorIndex: number): boolean => vendorIndex !== index
        );
        updateField("vendors", nextVendors);
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(event: FormEvent<HTMLFormElement>): void => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Process Name</label>
                        <input
                            type="text"
                            value={values.process_name}
                            onChange={handleProcessNameChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Process ID</label>
                        <input
                            type="text"
                            value={values.process_id}
                            onChange={handleProcessIdChange}
                            readOnly={isEdit}
                            className={`mt-2 w-full rounded-md border px-3 py-2 text-sm ${isEdit ? "bg-gray-100 text-gray-500 border-gray-200" : "border-gray-300"
                                }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <select
                            value={values.status}
                            onChange={handleStatusChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                        <select
                            value={values.category}
                            onChange={handleCategoryChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="outsourced">Outsourced</option>
                            <option value="in_house">In-house</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pricing Type</label>
                        <select
                            value={values.pricing_type}
                            onChange={handlePricingTypeChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="tier">Tier-Based</option>
                            <option value="formula">Formula-Based</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Standard Lead Time (days)</label>
                        <input
                            type="number"
                            min={1}
                            value={values.standard_lead_time}
                            onChange={handleLeadTimeChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit of Measure</label>
                        <input
                            type="text"
                            value={values.unit_of_measure}
                            onChange={handleUnitChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Cost (KES)</label>
                        <input
                            type="text"
                            value={values.base_cost}
                            onChange={handleBaseCostChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approval Type</label>
                        <input
                            type="text"
                            value={values.approval_type}
                            onChange={handleApprovalTypeChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approval Margin Threshold (%)</label>
                        <input
                            type="text"
                            value={values.approval_margin_threshold}
                            onChange={handleApprovalThresholdChange}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                        <textarea
                            value={values.description}
                            onChange={handleDescriptionChange}
                            rows={4}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            {values.pricing_type === "tier" ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Tier Pricing</h2>
                        <button
                            type="button"
                            onClick={addTier}
                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                        >
                            Add Tier
                        </button>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Tier</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Min Qty</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Max Qty</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Cost</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {values.tiers.length > 0 ? (
                                    values.tiers.map((tier: ProcessTierFormValues, index: number): ReactElement => (
                                        <tr key={`${tier.tier_number}-${index}`}>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tier.tier_number}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleTierChange(index, "tier_number", Number(event.target.value))
                                                    }
                                                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tier.quantity_from}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleTierChange(index, "quantity_from", Number(event.target.value))
                                                    }
                                                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tier.quantity_to}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleTierChange(index, "quantity_to", Number(event.target.value))
                                                    }
                                                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={tier.price}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleTierChange(index, "price", event.target.value)
                                                    }
                                                    className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={tier.cost}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleTierChange(index, "cost", event.target.value)
                                                    }
                                                    className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(): void => removeTier(index)}
                                                    className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                                            No tiers added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Formula Variables</h2>
                        <button
                            type="button"
                            onClick={addVariable}
                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                        >
                            Add Variable
                        </button>
                    </div>
                    <div className="mt-4 space-y-4">
                        {values.variables.length > 0 ? (
                            values.variables.map(
                                (variable: ProcessVariableFormValues, index: number): ReactElement => (
                                    <div key={`${variable.variable_name}-${index}`} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-gray-900">Variable {index + 1}</div>
                                            <button
                                                type="button"
                                                onClick={(): void => removeVariable(index)}
                                                className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                                                <input
                                                    type="text"
                                                    value={variable.variable_name}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleVariableChange(index, "variable_name", event.target.value)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                                                <select
                                                    value={variable.variable_type}
                                                    onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                                                        handleVariableChange(index, "variable_type", event.target.value as ProcessVariableType)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="number">Numeric</option>
                                                    <option value="alphanumeric">Alphanumeric</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</label>
                                                <input
                                                    type="text"
                                                    value={variable.unit}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleVariableChange(index, "unit", event.target.value)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price (KES)</label>
                                                <input
                                                    type="text"
                                                    value={variable.price}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleVariableChange(index, "price", event.target.value)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rate</label>
                                                <input
                                                    type="text"
                                                    value={variable.rate}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleVariableChange(index, "rate", event.target.value)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Default Value</label>
                                                <input
                                                    type="text"
                                                    value={variable.default_value ?? ""}
                                                    onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                        handleVariableChange(index, "default_value", event.target.value || null)
                                                    }
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                                                <textarea
                                                    value={variable.description}
                                                    onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                                                        handleVariableChange(index, "description", event.target.value)
                                                    }
                                                    rows={3}
                                                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="text-sm text-gray-500">No variables added yet.</div>
                        )}
                    </div>
                </div>
            )}

            {values.category === "outsourced" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Vendors</h2>
                        <button
                            type="button"
                            onClick={addVendor}
                            className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                        >
                            Add Vendor
                        </button>
                    </div>
                    <div className="mt-4 space-y-4">
                        {values.vendors.length > 0 ? (
                            values.vendors.map((vendor: ProcessVendorFormValues, index: number): ReactElement => (
                                <div key={`${vendor.vendor_name}-${index}`} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">Vendor {index + 1}</div>
                                        <button
                                            type="button"
                                            onClick={(): void => removeVendor(index)}
                                            className="text-sm font-semibold text-brand-red hover:text-brand-red/80"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor Name</label>
                                            <input
                                                type="text"
                                                value={vendor.vendor_name}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "vendor_name", event.target.value)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor ID</label>
                                            <input
                                                type="text"
                                                value={vendor.vendor_id}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "vendor_id", event.target.value)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VPS Score</label>
                                            <input
                                                type="text"
                                                value={vendor.vps_score}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "vps_score", event.target.value)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
                                            <select
                                                value={vendor.priority}
                                                onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                                                    handleVendorChange(index, "priority", event.target.value as ProcessVendorPriority)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            >
                                                <option value="preferred">Preferred</option>
                                                <option value="alternative">Alternative</option>
                                                <option value="backup">Backup</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Standard Lead Time (days)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={vendor.standard_lead_time}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "standard_lead_time", Number(event.target.value))
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rush Lead Time (days)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={vendor.rush_lead_time ?? ""}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(
                                                        index,
                                                        "rush_lead_time",
                                                        event.target.value ? Number(event.target.value) : null
                                                    )
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rush Fee (%)</label>
                                            <input
                                                type="text"
                                                value={vendor.rush_fee_percentage}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "rush_fee_percentage", event.target.value)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rush Threshold (days)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={vendor.rush_threshold_days}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "rush_threshold_days", Number(event.target.value))
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Minimum Order (KES)</label>
                                            <input
                                                type="text"
                                                value={vendor.minimum_order}
                                                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                    handleVendorChange(index, "minimum_order", event.target.value)
                                                }
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                                            <textarea
                                                value={vendor.notes}
                                                onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                                                    handleVendorChange(index, "notes", event.target.value)
                                                }
                                                rows={3}
                                                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={vendor.rush_enabled}
                                            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                                                handleVendorChange(index, "rush_enabled", event.target.checked)
                                            }
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">Rush pricing enabled</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">No vendors added yet.</div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
