"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeftIcon,
    ShoppingCartIcon,
    LoaderIcon,
    AlertCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckIcon,
    InfoIcon,
    CalculatorIcon,
    MessageSquareIcon,
    ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    fetchCatalogProduct,
    calculatePrice,
    type CatalogProduct,
    type SelectionValue,
    type PriceCalculationResult,
} from "@/services/store";
import type { ProductSpecGroup, SpecOption, SpecOptionRange } from "@/types/products";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatKES(amount: string | number | undefined | null): string {
    if (amount === undefined || amount === null) return "KES —";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "KES —";
    return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const GROUP_TYPE_LABELS: Record<string, string> = {
    quantity_tier: "Quantity",
    single_select_modifier: "Select Option",
    multi_select_modifier: "Select Options",
    numeric_input: "Enter Value",
    dimension_input: "Dimensions",
    multiplier: "Multiplier",
    display_only: "Info",
};

// ── Selection Input Components ────────────────────────────────────────────────

function QuantityTierSelector({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: number | null;
    onChange: (optionId: number) => void;
}): ReactElement {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
        >
            <option value="" disabled>Select quantity…</option>
            {group.options.map((opt: SpecOption) => (
                <option key={opt.id} value={opt.id}>
                    {opt.quantity_value != null ? `${opt.quantity_value} pcs` : opt.name}
                    {opt.selling_price ? ` — ${formatKES(opt.selling_price)}` : ""}
                    {opt.selling_price && opt.quantity_value != null
                        ? ` (${formatKES(parseFloat(opt.selling_price) / opt.quantity_value)}/pc)`
                        : ""}
                </option>
            ))}
        </select>
    );
}

function SingleSelectModifier({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: number | null;
    onChange: (optionId: number) => void;
}): ReactElement {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
        >
            <option value="" disabled>Select an option…</option>
            {group.options.map((opt: SpecOption) => {
                const modifier = opt.selling_price_modifier ? parseFloat(opt.selling_price_modifier) : 0;
                const modifierLabel = modifier !== 0
                    ? ` (${modifier > 0 ? "+" : ""}${formatKES(opt.selling_price_modifier!)})`
                    : "";
                return (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}{modifierLabel}
                    </option>
                );
            })}
        </select>
    );
}

function MultiSelectModifier({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: number[];
    onChange: (optionIds: number[]) => void;
}): ReactElement {
    const toggle = (id: number): void => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <div className="space-y-1.5">
            {group.options.map((opt: SpecOption) => {
                const selected = value.includes(opt.id);
                const modifier = opt.selling_price_modifier ? parseFloat(opt.selling_price_modifier) : 0;
                return (
                    <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggle(opt.id)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-blue accent-brand-blue"
                        />
                        <span className="text-sm text-gray-800">{opt.name}</span>
                        {modifier !== 0 && (
                            <span className="text-xs font-semibold text-brand-blue">
                                {modifier > 0 ? "+" : ""}{formatKES(opt.selling_price_modifier!)}
                            </span>
                        )}
                    </label>
                );
            })}
        </div>
    );
}

function NumericInputGroup({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: string;
    onChange: (val: string) => void;
}): ReactElement {
    const matchedRange = group.ranges.find((r: SpecOptionRange) => {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        const from = parseFloat(r.range_from);
        const to = r.range_to ? parseFloat(r.range_to) : Infinity;
        return num >= from && num <= to;
    });

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 max-w-xs">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter value…"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                />
                {group.ranges[0]?.unit_label && (
                    <span className="text-sm text-gray-500 flex-shrink-0">{group.ranges[0].unit_label}</span>
                )}
            </div>
            {group.ranges.length > 0 && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-1.5 text-left text-gray-500 font-medium">Range</th>
                                <th className="px-3 py-1.5 text-right text-gray-500 font-medium">Base Price</th>
                                <th className="px-3 py-1.5 text-right text-gray-500 font-medium">Per Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {group.ranges.map((r: SpecOptionRange) => {
                                const isMatch = r === matchedRange;
                                return (
                                    <tr key={r.id} className={isMatch ? "bg-brand-blue/5" : ""}>
                                        <td className={cn("px-3 py-1.5 font-medium", isMatch ? "text-brand-blue" : "text-gray-600")}>
                                            {r.range_from}–{r.range_to ?? "∞"}
                                            {r.unit_label ? ` ${r.unit_label}` : ""}
                                            {isMatch && <span className="ml-1.5 inline-flex h-4 w-4 rounded-full bg-brand-blue text-white items-center justify-center"><CheckIcon className="h-2.5 w-2.5" /></span>}
                                        </td>
                                        <td className={cn("px-3 py-1.5 text-right", isMatch ? "font-bold text-brand-blue" : "text-gray-600")}>
                                            {formatKES(r.selling_price_base)}
                                        </td>
                                        <td className={cn("px-3 py-1.5 text-right", isMatch ? "font-bold text-brand-blue" : "text-gray-600")}>
                                            {formatKES(r.selling_rate_per_unit)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function DimensionInputGroup({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: { width: string; height: string };
    onChange: (val: { width: string; height: string }) => void;
}): ReactElement {
    const unit = group.dim_unit ?? "mm";

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Width ({unit})</label>
                    <input
                        type="number"
                        step="any"
                        placeholder={group.dim_width_min ?? "0"}
                        value={value.width}
                        onChange={(e) => onChange({ ...value, width: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    />
                    {group.dim_width_min && group.dim_width_max && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{group.dim_width_min}–{group.dim_width_max} {unit}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Height ({unit})</label>
                    <input
                        type="number"
                        step="any"
                        placeholder={group.dim_height_min ?? "0"}
                        value={value.height}
                        onChange={(e) => onChange({ ...value, height: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                    />
                    {group.dim_height_min && group.dim_height_max && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{group.dim_height_min}–{group.dim_height_max} {unit}</p>
                    )}
                </div>
            </div>
            {group.selling_rate_per_sqm && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <InfoIcon className="h-3.5 w-3.5" />
                    Rate: {formatKES(group.selling_rate_per_sqm)}/m²
                    {group.min_selling_price && ` · Min: ${formatKES(group.min_selling_price)}`}
                </p>
            )}
        </div>
    );
}

function MultiplierSelector({
    group,
    value,
    onChange,
}: {
    group: ProductSpecGroup;
    value: number | null;
    onChange: (optionId: number) => void;
}): ReactElement {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
        >
            <option value="" disabled>Select multiplier…</option>
            {group.options.map((opt: SpecOption) => (
                <option key={opt.id} value={opt.id}>
                    ×{opt.multiplier_value ?? opt.name} — {opt.name}
                </option>
            ))}
        </select>
    );
}

// ── Spec Group Card ────────────────────────────────────────────────────────────

interface SpecGroupSelectionState {
    singleOption: number | null;
    multiOptions: number[];
    numericValue: string;
    dimValue: { width: string; height: string };
}

function SpecGroupInput({
    group,
    state,
    onUpdate,
}: {
    group: ProductSpecGroup;
    state: SpecGroupSelectionState;
    onUpdate: (update: Partial<SpecGroupSelectionState>) => void;
}): ReactElement | null {
    switch (group.group_type) {
        case "quantity_tier":
            return (
                <QuantityTierSelector
                    group={group}
                    value={state.singleOption}
                    onChange={(id) => onUpdate({ singleOption: id })}
                />
            );
        case "single_select_modifier":
            return (
                <SingleSelectModifier
                    group={group}
                    value={state.singleOption}
                    onChange={(id) => onUpdate({ singleOption: id })}
                />
            );
        case "multi_select_modifier":
            return (
                <MultiSelectModifier
                    group={group}
                    value={state.multiOptions}
                    onChange={(ids) => onUpdate({ multiOptions: ids })}
                />
            );
        case "numeric_input":
            return (
                <NumericInputGroup
                    group={group}
                    value={state.numericValue}
                    onChange={(val) => onUpdate({ numericValue: val })}
                />
            );
        case "dimension_input":
            return (
                <DimensionInputGroup
                    group={group}
                    value={state.dimValue}
                    onChange={(val) => onUpdate({ dimValue: val })}
                />
            );
        case "multiplier":
            return (
                <MultiplierSelector
                    group={group}
                    value={state.singleOption}
                    onChange={(id) => onUpdate({ singleOption: id })}
                />
            );
        case "display_only":
            return (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 flex gap-2">
                    <InfoIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{group.help_text || group.display_label || group.name}</span>
                </div>
            );
        default:
            return null;
    }
}

// ── Price Summary Panel ────────────────────────────────────────────────────────

function PriceSummary({
    result,
    isPending,
    error,
    onOrder,
}: {
    result: PriceCalculationResult | null;
    isPending: boolean;
    error: string | null;
    onOrder: () => void;
}): ReactElement {
    return (
        <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
            <div className="bg-brand-blue px-5 py-4">
                <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm font-medium">Your Price</span>
                    <CalculatorIcon className="h-4 w-4 text-white/60" />
                </div>
                {isPending && (
                    <div className="flex items-center gap-2 mt-2">
                        <LoaderIcon className="h-5 w-5 text-brand-yellow animate-spin" />
                        <span className="text-brand-yellow text-sm">Calculating…</span>
                    </div>
                )}
                {!isPending && result?.valid && (
                    <p className="text-3xl font-extrabold text-white mt-1">
                        {formatKES(result.final_selling_price)}
                    </p>
                )}
                {!isPending && !result && !error && (
                    <p className="text-white/60 text-sm mt-1">Make selections to see price</p>
                )}
                {error && (
                    <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                        <AlertCircleIcon className="h-3.5 w-3.5" />
                        {error}
                    </p>
                )}
            </div>

            {result?.valid && result.line_items.length > 0 && (
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Breakdown</p>
                    <div className="space-y-1.5">
                        {result.line_items.map((item, i) => (
                            <div key={i} className="flex justify-between items-start gap-2">
                                <span className="text-xs text-gray-600 leading-snug">{item.description}</span>
                                <span className="text-xs font-semibold text-gray-800 flex-shrink-0">
                                    {formatKES(item.selling_price)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 space-y-2">
                <button
                    type="button"
                    onClick={onOrder}
                    disabled={!result?.valid}
                    className="w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white hover:bg-brand-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Add to Cart
                </button>
                <button
                    type="button"
                    className="w-full rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                    Save for Later
                </button>
            </div>

            <div className="px-5 pb-4 flex items-center gap-2 text-xs text-gray-400">
                <ZapIcon className="h-3.5 w-3.5 text-brand-green" />
                Fast delivery · Quality guarantee
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

type GroupStates = Record<number, SpecGroupSelectionState>;

function buildInitialState(groups: ProductSpecGroup[]): GroupStates {
    const state: GroupStates = {};
    for (const g of groups) {
        const defaultOpt = g.options.find((o: SpecOption) => o.is_default);
        state[g.id] = {
            singleOption: defaultOpt?.id ?? null,
            multiOptions: defaultOpt ? [defaultOpt.id] : [],
            numericValue: "",
            dimValue: { width: "", height: "" },
        };
    }
    return state;
}

function buildSelectionsPayload(
    groups: ProductSpecGroup[],
    states: GroupStates,
): Record<number, SelectionValue> {
    const selections: Record<number, SelectionValue> = {};
    for (const g of groups) {
        const s = states[g.id];
        if (!s) continue;
        switch (g.group_type) {
            case "quantity_tier":
            case "single_select_modifier":
            case "multiplier":
                if (s.singleOption !== null) selections[g.id] = s.singleOption;
                break;
            case "multi_select_modifier":
                if (s.multiOptions.length > 0) selections[g.id] = s.multiOptions;
                break;
            case "numeric_input":
                if (s.numericValue.trim()) selections[g.id] = parseFloat(s.numericValue);
                break;
            case "dimension_input":
                if (s.dimValue.width && s.dimValue.height) {
                    selections[g.id] = {
                        width: parseFloat(s.dimValue.width),
                        height: parseFloat(s.dimValue.height),
                    };
                }
                break;
        }
    }
    return selections;
}

function isGroupVisible(group: ProductSpecGroup, selections: Record<number, SelectionValue>): boolean {
    if (group.parent_option === null) return true;
    for (const value of Object.values(selections)) {
        if (value === group.parent_option) return true;
        if (Array.isArray(value) && (value as number[]).includes(group.parent_option)) return true;
    }
    return false;
}

export default function ProductDetailPage(): ReactElement {
    const params = useParams();
    const router = useRouter();
    const productId = Number(params.productId);

    const { data: product, isLoading, isError } = useQuery<CatalogProduct>({
        queryKey: ["catalog-product", productId],
        queryFn: () => fetchCatalogProduct(productId),
        enabled: !isNaN(productId),
        staleTime: 30_000,
    });

    const [groupStates, setGroupStates] = useState<GroupStates>({});
    const [priceResult, setPriceResult] = useState<PriceCalculationResult | null>(null);
    const [priceError, setPriceError] = useState<string | null>(null);
    const [isPricing, setIsPricing] = useState<boolean>(false);

    useEffect(() => {
        if (product) {
            setGroupStates(buildInitialState(product.spec_groups));
        }
    }, [product]);

    const sortedGroups = product
        ? [...product.spec_groups].sort((a, b) => a.display_order - b.display_order)
        : [];

    const currentSelections = product
        ? buildSelectionsPayload(sortedGroups, groupStates)
        : {};

    const visibleGroups = sortedGroups.filter((g) => isGroupVisible(g, currentSelections));

    const recalculate = useCallback(
        async (groups: ProductSpecGroup[], states: GroupStates): Promise<void> => {
            if (!product || product.pricing_mode !== "auto_calculate") return;
            const payload = buildSelectionsPayload(
                groups.filter((g) => isGroupVisible(g, buildSelectionsPayload(groups, states))),
                states,
            );
            if (Object.keys(payload).length === 0) return;
            setIsPricing(true);
            setPriceError(null);
            try {
                const result = await calculatePrice(product.id, payload);
                setPriceResult(result);
                if (!result.valid && result.errors) {
                    setPriceError(result.errors.join(", "));
                }
            } catch (e: unknown) {
                setPriceError(e instanceof Error ? e.message : "Calculation failed");
            } finally {
                setIsPricing(false);
            }
        },
        [product],
    );

    const updateGroupState = (groupId: number, update: Partial<SpecGroupSelectionState>): void => {
        setGroupStates((prev) => {
            const next = { ...prev, [groupId]: { ...prev[groupId], ...update } };
            void recalculate(sortedGroups, next);
            return next;
        });
    };

    // ── Loading & error states ─────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoaderIcon className="h-10 w-10 text-brand-blue animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading product…</p>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircleIcon className="h-10 w-10 text-red-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold">Product not found</p>
                    <Link href="/store" className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline">
                        <ArrowLeftIcon className="h-3.5 w-3.5" />
                        Back to store
                    </Link>
                </div>
            </div>
        );
    }

    const isQuoteOnly = product.pricing_mode === "quote_only";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── HEADER ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex h-14 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-blue transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="h-5 w-px bg-gray-200" />
                        <nav className="flex items-center gap-1 text-xs text-gray-400 min-w-0">
                            <Link href="/store" className="hover:text-brand-blue transition-colors flex-shrink-0">Store</Link>
                            <ChevronDownIcon className="h-3 w-3 rotate-[-90deg] flex-shrink-0" />
                            {product.primary_category_name && (
                                <>
                                    <span className="hover:text-brand-blue cursor-pointer flex-shrink-0 hidden sm:inline">
                                        {product.primary_category_name}
                                    </span>
                                    <ChevronDownIcon className="h-3 w-3 rotate-[-90deg] flex-shrink-0 hidden sm:inline" />
                                </>
                            )}
                            <span className="text-gray-700 font-medium truncate">{product.name}</span>
                        </nav>
                        <div className="ml-auto">
                            <Link href="/" className="flex-shrink-0">
                                <Image src="/logo/logo.png" alt="Print Duka" width={120} height={54} className="h-8 w-auto" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* ── LEFT: image + product info ──────────────── */}
                    <div className="space-y-4">
                        {/* Product image */}
                        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShoppingCartIcon className="h-20 w-20 text-gray-200" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5" />
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                                {product.bestseller_badge && (
                                    <span className="rounded-full bg-brand-yellow px-2.5 py-0.5 text-[11px] font-bold text-brand-black shadow-sm">Best Seller</span>
                                )}
                                {product.new_arrival && (
                                    <span className="rounded-full bg-brand-green text-white px-2.5 py-0.5 text-[11px] font-bold shadow-sm">New</span>
                                )}
                                {product.on_sale_badge && (
                                    <span className="rounded-full bg-brand-red text-white px-2.5 py-0.5 text-[11px] font-bold shadow-sm">Sale</span>
                                )}
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className={cn(
                                    "rounded-full px-3 py-1 text-xs font-bold shadow-sm",
                                    isQuoteOnly ? "bg-brand-orange text-white" : "bg-brand-blue text-white",
                                )}>
                                    {isQuoteOnly ? "Custom Quote" : "Instant Pricing"}
                                </span>
                            </div>
                        </div>

                        {/* Product info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            {product.primary_category_name && (
                                <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue/70">
                                    {product.primary_category_name}
                                    {product.sub_category_name && ` · ${product.sub_category_name}`}
                                </p>
                            )}
                            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
                            {product.short_description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{product.short_description}</p>
                            )}
                            {product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {product.tags.map((tag) => (
                                        <span key={tag.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Long description */}
                        {product.long_description && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Product Details</h3>
                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {product.long_description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: configurator + price below ───────── */}
                    <div className="space-y-4">
                        {isQuoteOnly ? (
                            <>
                                <div className="bg-white rounded-2xl border border-brand-orange/30 shadow-sm p-6 text-center space-y-4">
                                    <MessageSquareIcon className="h-10 w-10 text-brand-orange mx-auto" />
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">This product requires a custom quote</h2>
                                        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                            Pricing depends on your specific requirements. Our team will get back to you within 2 hours.
                                        </p>
                                    </div>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white hover:bg-brand-orange/90 transition-colors"
                                    >
                                        <MessageSquareIcon className="h-4 w-4" />
                                        Request a Quote
                                    </Link>
                                </div>
                                <div className="rounded-2xl border border-brand-orange/30 bg-white shadow-md p-5 space-y-3">
                                    <h3 className="font-bold text-gray-900">Get a Quote</h3>
                                    <p className="text-sm text-gray-500">Tell us about your project and we'll provide a tailored price within 2 hours.</p>
                                    <Link
                                        href="/contact"
                                        className="block w-full text-center rounded-xl bg-brand-orange py-3 text-sm font-bold text-white hover:bg-brand-orange/90 transition-colors"
                                    >
                                        Contact Us
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Configure header */}
                                <div className="flex items-center gap-2">
                                    <CalculatorIcon className="h-4 w-4 text-brand-blue" />
                                    <h2 className="text-base font-bold text-gray-900">Configure Your Order</h2>
                                    <span className="text-xs text-gray-400">— price updates live</span>
                                </div>

                                {visibleGroups.length === 0 && (
                                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                                        <p className="text-sm text-gray-500">No configuration needed for this product.</p>
                                    </div>
                                )}

                                {visibleGroups.map((group, i) => (
                                    <SpecGroupSection
                                        key={group.id}
                                        group={group}
                                        stepNumber={i + 1}
                                        state={groupStates[group.id] ?? {
                                            singleOption: null,
                                            multiOptions: [],
                                            numericValue: "",
                                            dimValue: { width: "", height: "" },
                                        }}
                                        onUpdate={(update) => updateGroupState(group.id, update)}
                                    />
                                ))}

                                {/* Price summary sits below the configurator */}
                                <PriceSummary
                                    result={priceResult}
                                    isPending={isPricing}
                                    error={priceError}
                                    onOrder={() => {
                                        void (async () => {
                                            const payload = buildSelectionsPayload(visibleGroups, groupStates);
                                            const result = await calculatePrice(product.id, payload);
                                            if (result.valid) {
                                                setPriceResult(result);
                                            }
                                        })();
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Spec Group Section Card ────────────────────────────────────────────────────

function SpecGroupSection({
    group,
    stepNumber,
    state,
    onUpdate,
}: {
    group: ProductSpecGroup;
    stepNumber: number;
    state: SpecGroupSelectionState;
    onUpdate: (update: Partial<SpecGroupSelectionState>) => void;
}): ReactElement {
    const [expanded, setExpanded] = useState<boolean>(true);

    const hasSelection: boolean = (() => {
        switch (group.group_type) {
            case "quantity_tier":
            case "single_select_modifier":
            case "multiplier":
                return state.singleOption !== null;
            case "multi_select_modifier":
                return state.multiOptions.length > 0;
            case "numeric_input":
                return state.numericValue.trim().length > 0;
            case "dimension_input":
                return state.dimValue.width.trim().length > 0 && state.dimValue.height.trim().length > 0;
            default:
                return true;
        }
    })();

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center gap-3 py-2 text-left"
            >
                <span className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                    hasSelection
                        ? "bg-brand-blue text-white"
                        : "bg-gray-100 text-gray-500",
                )}>
                    {hasSelection ? <CheckIcon className="h-3.5 w-3.5" /> : stepNumber}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{group.display_label || group.name}</span>
                        <span className="text-xs text-gray-400">{GROUP_TYPE_LABELS[group.group_type]}</span>
                        {group.is_required && (
                            <span className="text-[10px] font-semibold text-red-500">Required</span>
                        )}
                    </div>
                    {group.help_text && !expanded && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{group.help_text}</p>
                    )}
                </div>
                {expanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {expanded && (
                <div className="pl-9 space-y-3">
                    {group.header_image && (
                        <img src={group.header_image} alt={group.name} className="w-full max-h-32 rounded-xl object-cover" />
                    )}
                    {group.help_text && (
                        <p className="text-xs text-gray-500 leading-relaxed">{group.help_text}</p>
                    )}
                    <SpecGroupInput group={group} state={state} onUpdate={onUpdate} />
                </div>
            )}

            <div className="border-b border-gray-100 ml-9" />
        </div>
    );
}
