"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    PlusIcon,
    Trash2Icon,
    ChevronDownIcon,
    ChevronRightIcon,
    GripVerticalIcon,
    BookOpenIcon,
    ImageIcon,
} from "lucide-react";
import {
    createSpecGroup,
    updateSpecGroup,
    deleteSpecGroup,
    fetchSpecGroups,
    createSpecOption,
    updateSpecOption,
    deleteSpecOption,
    uploadSpecOptionImage,
    uploadSpecGroupHeaderImage,
    createSpecOptionRange,
    updateSpecOptionRange,
    deleteSpecOptionRange,
} from "@/services/products";
import { fetchSpecGroupLibraries } from "@/services/product-catalog-setup";
import type {
    ProductSpecGroup,
    SpecGroupType,
    SpecOption,
    SpecOptionRange,
    CreateSpecGroupPayload,
} from "@/types/products";

interface SpecGroupsBuilderProps {
    productId: number;
    pricingMode: "auto_calculate" | "quote_only";
}

const GROUP_TYPE_LABELS: Record<SpecGroupType, string> = {
    quantity_tier: "Quantity Tiers",
    single_select_modifier: "Single Select",
    multi_select_modifier: "Multi Select",
    numeric_input: "Numeric Input",
    dimension_input: "Dimensions (W × H)",
    multiplier: "Multiplier",
    display_only: "Display Only",
};

const GROUP_TYPE_HINTS: Record<SpecGroupType, string> = {
    quantity_tier: "Customer picks a quantity — each tier has a fixed total price",
    single_select_modifier: "Customer picks one option — each adds/subtracts a price",
    multi_select_modifier: "Customer picks multiple — each adds a price modifier",
    numeric_input: "Customer types a number — price comes from matching range",
    dimension_input: "Customer enters W × H — priced per square metre",
    multiplier: "Multiplies the running total (e.g. rush ×1.5)",
    display_only: "Informational only — no price impact",
};

const inputCls =
    "w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";
const selectCls =
    "w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue";
const btnSecondary =
    "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors";
const btnDanger =
    "inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors";

function SpecOptionsEditor({
    group,
    onRefresh,
}: {
    group: ProductSpecGroup;
    onRefresh: () => void;
}): ReactElement {
    const [newOption, setNewOption] = useState({
        name: "",
        quantity_value: "",
        selling_price: "",
        vendor_cost: "",
        selling_price_modifier: "",
        vendor_cost_modifier: "",
        multiplier_value: "",
        is_default: false,
    });

    const addOption = async (): Promise<void> => {
        if (!newOption.name.trim()) {
            toast.error("Option name is required");
            return;
        }
        try {
            await createSpecOption({
                spec_group: group.id,
                name: newOption.name.trim(),
                display_order: group.options.length,
                is_default: newOption.is_default,
                is_active: true,
                quantity_value: newOption.quantity_value ? Number(newOption.quantity_value) : null,
                selling_price: newOption.selling_price.trim() || null,
                vendor_cost: newOption.vendor_cost.trim() || null,
                selling_price_modifier: newOption.selling_price_modifier.trim() || null,
                vendor_cost_modifier: newOption.vendor_cost_modifier.trim() || null,
                multiplier_value: newOption.multiplier_value.trim() || null,
            });
            setNewOption({
                name: "",
                quantity_value: "",
                selling_price: "",
                vendor_cost: "",
                selling_price_modifier: "",
                vendor_cost_modifier: "",
                multiplier_value: "",
                is_default: false,
            });
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to add option");
        }
    };

    const removeOption = async (optionId: number): Promise<void> => {
        try {
            await deleteSpecOption(optionId);
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to remove option");
        }
    };

    const updateDefault = async (option: SpecOption, checked: boolean): Promise<void> => {
        try {
            await updateSpecOption(option.id, { is_default: checked });
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to update option");
        }
    };

    const isTier = group.group_type === "quantity_tier";
    const isModifier =
        group.group_type === "single_select_modifier" ||
        group.group_type === "multi_select_modifier";
    const isMultiplier = group.group_type === "multiplier";

    return (
        <div className="space-y-3">
            {group.options.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                                {isTier && (
                                    <>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Qty</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Sell (KES)</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Cost (KES)</th>
                                    </>
                                )}
                                {isModifier && (
                                    <>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">+Sell (KES)</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">+Cost (KES)</th>
                                    </>
                                )}
                                {isMultiplier && (
                                    <th className="px-3 py-2 text-right font-medium text-gray-600">× Value</th>
                                )}
                                <th className="px-3 py-2 text-center font-medium text-gray-600">Default</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {group.options.map((opt) => (
                                <tr key={opt.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            {opt.preview_image ? (
                                                <img
                                                    src={opt.preview_image}
                                                    alt={opt.name}
                                                    className="h-7 w-7 rounded object-cover border border-gray-200 flex-shrink-0"
                                                />
                                            ) : (
                                                <label
                                                    className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 hover:border-brand-blue hover:bg-brand-blue/5"
                                                    title="Upload preview image"
                                                >
                                                    <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) void uploadSpecOptionImage(opt.id, file).then(onRefresh);
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            <span className="font-medium text-gray-800">{opt.name}</span>
                                        </div>
                                    </td>
                                    {isTier && (
                                        <>
                                            <td className="px-3 py-2 text-right text-gray-600">{opt.quantity_value ?? "—"}</td>
                                            <td className="px-3 py-2 text-right text-gray-600">{opt.selling_price ?? "—"}</td>
                                            <td className="px-3 py-2 text-right text-gray-600">{opt.vendor_cost ?? "—"}</td>
                                        </>
                                    )}
                                    {isModifier && (
                                        <>
                                            <td className="px-3 py-2 text-right text-gray-600">{opt.selling_price_modifier ?? "—"}</td>
                                            <td className="px-3 py-2 text-right text-gray-600">{opt.vendor_cost_modifier ?? "—"}</td>
                                        </>
                                    )}
                                    {isMultiplier && (
                                        <td className="px-3 py-2 text-right text-gray-600">{opt.multiplier_value ?? "—"}</td>
                                    )}
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={opt.is_default}
                                            onChange={(e) => void updateDefault(opt, e.target.checked)}
                                            className="h-3.5 w-3.5 rounded text-brand-blue"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => void removeOption(opt.id)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2Icon className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid grid-cols-12 gap-2 items-end rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                <div className="col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input
                        type="text"
                        placeholder="e.g. 100 pcs"
                        className={inputCls}
                        value={newOption.name}
                        onChange={(e) => setNewOption((p) => ({ ...p, name: e.target.value }))}
                    />
                </div>
                {isTier && (
                    <>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Qty</label>
                            <input type="number" placeholder="100" className={inputCls} value={newOption.quantity_value} onChange={(e) => setNewOption((p) => ({ ...p, quantity_value: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Sell KES</label>
                            <input type="number" step="0.01" placeholder="5000" className={inputCls} value={newOption.selling_price} onChange={(e) => setNewOption((p) => ({ ...p, selling_price: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Cost KES</label>
                            <input type="number" step="0.01" placeholder="3000" className={inputCls} value={newOption.vendor_cost} onChange={(e) => setNewOption((p) => ({ ...p, vendor_cost: e.target.value }))} />
                        </div>
                    </>
                )}
                {isModifier && (
                    <>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">+Sell KES</label>
                            <input type="number" step="0.01" placeholder="200" className={inputCls} value={newOption.selling_price_modifier} onChange={(e) => setNewOption((p) => ({ ...p, selling_price_modifier: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">+Cost KES</label>
                            <input type="number" step="0.01" placeholder="120" className={inputCls} value={newOption.vendor_cost_modifier} onChange={(e) => setNewOption((p) => ({ ...p, vendor_cost_modifier: e.target.value }))} />
                        </div>
                    </>
                )}
                {isMultiplier && (
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">× Value</label>
                        <input type="number" step="0.01" placeholder="1.5" className={inputCls} value={newOption.multiplier_value} onChange={(e) => setNewOption((p) => ({ ...p, multiplier_value: e.target.value }))} />
                    </div>
                )}
                <div className="col-span-1 flex items-end pb-0.5">
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={newOption.is_default} onChange={(e) => setNewOption((p) => ({ ...p, is_default: e.target.checked }))} className="h-3.5 w-3.5 rounded text-brand-blue" />
                        Def
                    </label>
                </div>
                <div className="col-span-2 flex justify-end">
                    <button type="button" onClick={() => void addOption()} className="w-full rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-blue/90 transition-colors">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

function SpecRangesEditor({
    group,
    onRefresh,
}: {
    group: ProductSpecGroup;
    onRefresh: () => void;
}): ReactElement {
    const [newRange, setNewRange] = useState({
        range_from: "",
        range_to: "",
        unit_label: "",
        selling_price_base: "0",
        selling_rate_per_unit: "0",
        vendor_cost_base: "0",
        vendor_rate_per_unit: "0",
    });

    const addRange = async (): Promise<void> => {
        if (!newRange.range_from.trim()) {
            toast.error("Range from is required");
            return;
        }
        try {
            await createSpecOptionRange({
                spec_group: group.id,
                range_from: newRange.range_from,
                range_to: newRange.range_to.trim() || null,
                unit_label: newRange.unit_label.trim(),
                selling_price_base: newRange.selling_price_base || "0",
                selling_rate_per_unit: newRange.selling_rate_per_unit || "0",
                vendor_cost_base: newRange.vendor_cost_base || "0",
                vendor_rate_per_unit: newRange.vendor_rate_per_unit || "0",
                display_order: group.ranges.length,
            });
            setNewRange({ range_from: "", range_to: "", unit_label: "", selling_price_base: "0", selling_rate_per_unit: "0", vendor_cost_base: "0", vendor_rate_per_unit: "0" });
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to add range");
        }
    };

    const removeRange = async (rangeId: number): Promise<void> => {
        try {
            await deleteSpecOptionRange(rangeId);
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to remove range");
        }
    };

    return (
        <div className="space-y-3">
            {group.ranges.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">From</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">To</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Unit</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-600">Sell Base</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-600">Sell/Unit</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-600">Cost Base</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-600">Cost/Unit</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {group.ranges.map((r: SpecOptionRange) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-gray-800">{r.range_from}</td>
                                    <td className="px-3 py-2 text-gray-600">{r.range_to ?? "∞"}</td>
                                    <td className="px-3 py-2 text-gray-600">{r.unit_label || "—"}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{r.selling_price_base}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{r.selling_rate_per_unit}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{r.vendor_cost_base}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">{r.vendor_rate_per_unit}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button type="button" onClick={() => void removeRange(r.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2Icon className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="grid grid-cols-8 gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                {(
                    [
                        { key: "range_from", label: "From *", placeholder: "0" },
                        { key: "range_to", label: "To (blank=∞)", placeholder: "9999" },
                        { key: "unit_label", label: "Unit", placeholder: "stitches" },
                        { key: "selling_price_base", label: "Sell Base", placeholder: "0" },
                        { key: "selling_rate_per_unit", label: "Sell/Unit", placeholder: "0.50" },
                        { key: "vendor_cost_base", label: "Cost Base", placeholder: "0" },
                        { key: "vendor_rate_per_unit", label: "Cost/Unit", placeholder: "0.30" },
                    ] as Array<{ key: keyof typeof newRange; label: string; placeholder: string }>
                ).map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input
                            type={key === "unit_label" ? "text" : "number"}
                            step="0.0001"
                            placeholder={placeholder}
                            className={inputCls}
                            value={newRange[key]}
                            onChange={(e) => setNewRange((p) => ({ ...p, [key]: e.target.value }))}
                        />
                    </div>
                ))}
                <div className="flex items-end">
                    <button type="button" onClick={() => void addRange()} className="w-full rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-blue/90 transition-colors">
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

function DimensionGroupEditor({
    group,
    onRefresh,
}: {
    group: ProductSpecGroup;
    onRefresh: () => void;
}): ReactElement {
    const [fields, setFields] = useState({
        dim_unit: group.dim_unit,
        dim_width_min: group.dim_width_min ?? "",
        dim_width_max: group.dim_width_max ?? "",
        dim_height_min: group.dim_height_min ?? "",
        dim_height_max: group.dim_height_max ?? "",
        selling_rate_per_sqm: group.selling_rate_per_sqm ?? "",
        vendor_rate_per_sqm: group.vendor_rate_per_sqm ?? "",
        min_selling_price: group.min_selling_price ?? "",
        min_vendor_cost: group.min_vendor_cost ?? "",
    });

    const save = async (): Promise<void> => {
        try {
            await updateSpecGroup(group.id, {
                dim_unit: fields.dim_unit,
                dim_width_min: fields.dim_width_min || null,
                dim_width_max: fields.dim_width_max || null,
                dim_height_min: fields.dim_height_min || null,
                dim_height_max: fields.dim_height_max || null,
                selling_rate_per_sqm: fields.selling_rate_per_sqm || null,
                vendor_rate_per_sqm: fields.vendor_rate_per_sqm || null,
                min_selling_price: fields.min_selling_price || null,
                min_vendor_cost: fields.min_vendor_cost || null,
            });
            toast.success("Dimension settings saved");
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to save dimension settings");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Unit</label>
                    <select className={selectCls} value={fields.dim_unit} onChange={(e) => setFields((p) => ({ ...p, dim_unit: e.target.value as "mm" | "cm" | "in" }))}>
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="in">inches</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Width Min</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.dim_width_min} onChange={(e) => setFields((p) => ({ ...p, dim_width_min: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Width Max</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.dim_width_max} onChange={(e) => setFields((p) => ({ ...p, dim_width_max: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Height Min</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.dim_height_min} onChange={(e) => setFields((p) => ({ ...p, dim_height_min: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Height Max</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.dim_height_max} onChange={(e) => setFields((p) => ({ ...p, dim_height_max: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Sell Rate/m²</label>
                    <input type="number" step="0.0001" className={inputCls} value={fields.selling_rate_per_sqm} onChange={(e) => setFields((p) => ({ ...p, selling_rate_per_sqm: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Cost Rate/m²</label>
                    <input type="number" step="0.0001" className={inputCls} value={fields.vendor_rate_per_sqm} onChange={(e) => setFields((p) => ({ ...p, vendor_rate_per_sqm: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Sell Price</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.min_selling_price} onChange={(e) => setFields((p) => ({ ...p, min_selling_price: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Cost</label>
                    <input type="number" step="0.01" className={inputCls} value={fields.min_vendor_cost} onChange={(e) => setFields((p) => ({ ...p, min_vendor_cost: e.target.value }))} />
                </div>
            </div>
            <button type="button" onClick={() => void save()} className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-medium text-white hover:bg-brand-blue/90 transition-colors">
                Save Dimension Settings
            </button>
        </div>
    );
}

function SpecGroupCard({
    group,
    onDeleted,
    onRefresh,
}: {
    group: ProductSpecGroup;
    onDeleted: () => void;
    onRefresh: () => void;
}): ReactElement {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [editingName, setEditingName] = useState<boolean>(false);
    const [nameValue, setNameValue] = useState<string>(group.name);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const saveName = async (): Promise<void> => {
        if (!nameValue.trim()) return;
        try {
            await updateSpecGroup(group.id, {
                name: nameValue.trim(),
                display_label: nameValue.trim(),
            });
            setEditingName(false);
            onRefresh();
        } catch (_e: unknown) {
            toast.error("Failed to rename group");
        }
    };

    const removeGroup = async (): Promise<void> => {
        try {
            await deleteSpecGroup(group.id);
            onDeleted();
        } catch (_e: unknown) {
            toast.error("Failed to delete spec group");
        }
    };

    const needsOptions =
        group.group_type !== "numeric_input" && group.group_type !== "dimension_input";
    const needsRanges = group.group_type === "numeric_input";
    const needsDimensions = group.group_type === "dimension_input";

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <GripVerticalIcon className="h-4 w-4 text-gray-300 flex-shrink-0 cursor-grab" />
                <button
                    type="button"
                    onClick={() => setExpanded((p) => !p)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    {expanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    {editingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                autoFocus
                                className="rounded border border-brand-blue px-2 py-1 text-sm font-medium text-gray-900 focus:outline-none"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                onBlur={() => void saveName()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") void saveName();
                                    if (e.key === "Escape") setEditingName(false);
                                }}
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            className="text-sm font-semibold text-gray-900 hover:text-brand-blue text-left"
                            title="Click to rename"
                        >
                            {group.name}
                        </button>
                    )}
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {GROUP_TYPE_LABELS[group.group_type]}
                </span>
                {group.parent_option !== null && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Conditional
                    </span>
                )}
                {group.is_required && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        Required
                    </span>
                )}
                <div className="flex items-center gap-1">
                    {confirmDelete ? (
                        <>
                            <button type="button" onClick={() => void removeGroup()} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Confirm Delete</button>
                            <button type="button" onClick={() => setConfirmDelete(false)} className={btnSecondary}>Cancel</button>
                        </>
                    ) : (
                        <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
                            <Trash2Icon className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <p className="text-xs text-gray-500">{GROUP_TYPE_HINTS[group.group_type]}</p>
                        <label className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors">
                            {group.header_image ? (
                                <img src={group.header_image} alt="header" className="h-5 w-5 rounded object-cover" />
                            ) : (
                                <ImageIcon className="h-3.5 w-3.5" />
                            )}
                            {group.header_image ? "Change header" : "Add header image"}
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void uploadSpecGroupHeaderImage(group.id, file).then(onRefresh);
                                }}
                            />
                        </label>
                    </div>
                    {needsOptions && <SpecOptionsEditor group={group} onRefresh={onRefresh} />}
                    {needsRanges && <SpecRangesEditor group={group} onRefresh={onRefresh} />}
                    {needsDimensions && <DimensionGroupEditor group={group} onRefresh={onRefresh} />}
                </div>
            )}
        </div>
    );
}

function AddGroupPanel({
    productId,
    onAdded,
    nextOrder,
    existingGroups,
}: {
    productId: number;
    onAdded: () => void;
    nextOrder: number;
    existingGroups: ProductSpecGroup[];
}): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const [mode, setMode] = useState<"custom" | "library">("custom");
    const [groupType, setGroupType] = useState<SpecGroupType>("quantity_tier");
    const [name, setName] = useState<string>("");
    const [isRequired, setIsRequired] = useState<boolean>(true);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>("");
    const [parentGroupId, setParentGroupId] = useState<string>("");
    const [parentOptionId, setParentOptionId] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const parentGroup = existingGroups.find((g) => String(g.id) === parentGroupId) ?? null;
    const parentOptions = parentGroup?.options ?? [];

    const { data: libraries = [] } = useQuery({
        queryKey: ["spec-group-libraries"],
        queryFn: () => fetchSpecGroupLibraries(),
        staleTime: 5 * 60 * 1000,
        enabled: open && mode === "library",
    });

    const handleAdd = async (): Promise<void> => {
        if (mode === "custom" && !name.trim()) {
            toast.error("Group name is required");
            return;
        }
        if (mode === "library" && !selectedLibraryId) {
            toast.error("Select a library group");
            return;
        }

        setSaving(true);
        try {
            const libraryGroup = mode === "library" ? libraries.find((l) => l.id === Number(selectedLibraryId)) : null;

            const payload: CreateSpecGroupPayload = {
                product: productId,
                library_group: mode === "library" ? Number(selectedLibraryId) : null,
                uses_library_options: mode === "library",
                name: mode === "library" ? (libraryGroup?.name ?? name) : name.trim(),
                display_label: mode === "library" ? ((libraryGroup?.display_label || libraryGroup?.name) ?? "") : name.trim(),
                help_text: "",
                group_type: mode === "library" ? (libraryGroup?.group_type ?? groupType) : groupType,
                is_required: isRequired,
                display_order: nextOrder,
                is_active: true,
                parent_option: parentOptionId ? Number(parentOptionId) : null,
                dim_unit: "mm",
                dim_width_min: null,
                dim_width_max: null,
                dim_height_min: null,
                dim_height_max: null,
                selling_rate_per_sqm: null,
                vendor_rate_per_sqm: null,
                min_selling_price: null,
                min_vendor_cost: null,
            };

            await createSpecGroup(payload);
            setName("");
            setSelectedLibraryId("");
            setParentGroupId("");
            setParentOptionId("");
            setOpen(false);
            onAdded();
        } catch (_e: unknown) {
            toast.error("Failed to add spec group");
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
                <PlusIcon className="h-4 w-4" />
                Add Spec Group
            </button>
        );
    }

    return (
        <div className="rounded-xl border-2 border-brand-blue bg-brand-blue/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-blue">New Spec Group</p>
                <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode("custom")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${mode === "custom" ? "bg-brand-blue text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Custom
                </button>
                <button
                    type="button"
                    onClick={() => setMode("library")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${mode === "library" ? "bg-brand-blue text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                    <BookOpenIcon className="h-3.5 w-3.5" />
                    From Library
                </button>
            </div>

            {mode === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Group Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Quantity, Paper Weight"
                            className={inputCls}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Group Type *</label>
                        <select
                            className={selectCls}
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value as SpecGroupType)}
                        >
                            {(Object.entries(GROUP_TYPE_LABELS) as Array<[SpecGroupType, string]>).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {mode === "library" && (
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Select from Library *</label>
                    <select
                        className={selectCls}
                        value={selectedLibraryId}
                        onChange={(e) => setSelectedLibraryId(e.target.value)}
                    >
                        <option value="">— choose a library group —</option>
                        {libraries.map((lib) => (
                            <option key={lib.id} value={lib.id}>
                                {lib.name} ({GROUP_TYPE_LABELS[lib.group_type]})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-blue"
                />
                <span className="text-xs text-gray-700">Required — customer must make a selection</span>
            </label>

            {existingGroups.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
                    <p className="text-xs font-medium text-gray-700">Display condition <span className="font-normal text-gray-400">(optional — show only when…)</span></p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">When group</label>
                            <select
                                className={selectCls}
                                value={parentGroupId}
                                onChange={(e) => { setParentGroupId(e.target.value); setParentOptionId(""); }}
                            >
                                <option value="">— always show —</option>
                                {existingGroups.map((g) => (
                                    <option key={g.id} value={String(g.id)}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Has option selected</label>
                            <select
                                className={selectCls}
                                value={parentOptionId}
                                onChange={(e) => setParentOptionId(e.target.value)}
                                disabled={!parentGroupId || parentOptions.length === 0}
                            >
                                <option value="">— select option —</option>
                                {parentOptions.map((opt) => (
                                    <option key={opt.id} value={String(opt.id)}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {parentGroupId && !parentOptionId && (
                        <p className="text-xs text-amber-600">Select a specific option to trigger this group, or clear the group to always show it.</p>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => void handleAdd()}
                disabled={saving}
                className="rounded-lg bg-brand-blue px-5 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
            >
                {saving ? "Adding…" : "Add Group"}
            </button>
        </div>
    );
}

export default function SpecGroupsBuilder({
    productId,
    pricingMode,
}: SpecGroupsBuilderProps): ReactElement {
    const queryClient = useQueryClient();

    const { data: specGroups = [], isLoading, refetch } = useQuery<ProductSpecGroup[]>({
        queryKey: ["spec-groups", productId],
        queryFn: () => fetchSpecGroups(productId),
        staleTime: 0,
    });

    const refresh = (): void => {
        void queryClient.invalidateQueries({ queryKey: ["spec-groups", productId] });
    };

    if (pricingMode === "quote_only") {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-semibold text-amber-800">Quote Only Mode</p>
                <p className="mt-1 text-xs text-amber-700">
                    Spec groups are not used in Quote Only mode. Production Team prices each order manually.
                    Switch to Auto Calculate to configure spec groups.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Spec Groups</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Define the pricing dimensions customers configure when ordering this product.
                    </p>
                </div>
                <span className="text-xs text-gray-400">{specGroups.length} group{specGroups.length !== 1 ? "s" : ""}</span>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            )}

            {!isLoading && specGroups.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center">
                    <p className="text-sm text-gray-500">No spec groups yet.</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Add a group to configure how customers select options and how prices are calculated.
                    </p>
                </div>
            )}

            {!isLoading &&
                specGroups.map((group) => (
                    <SpecGroupCard
                        key={group.id}
                        group={group}
                        onDeleted={refresh}
                        onRefresh={refresh}
                    />
                ))}

            <AddGroupPanel
                productId={productId}
                onAdded={refresh}
                nextOrder={specGroups.length}
                existingGroups={specGroups}
            />
        </div>
    );
}
