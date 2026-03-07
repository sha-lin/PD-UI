"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import VendorForm from "@/features/vendors/components/VendorForm";
import { createVendor, fetchVendor, updateVendor } from "@/services/vendors";
import type { CreateVendorPayload, UpdateVendorPayload, Vendor, VendorFormValues } from "@/types/vendors";

interface VendorFormWorkspaceProps {
    mode: "create" | "edit";
    vendorId?: number;
    homeLabel: string;
    homeHref: string;
    listLabel: string;
    listHref: string;
    pageLabel: string;
    title: string;
    description: string;
    submitLabel: string;
    successRedirectHref: string;
    cancelRedirectHref: string;
}

const buildInitialValues = (): VendorFormValues => {
    return {
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        business_address: "",
        tax_pin: "",
        payment_terms: "",
        payment_method: "",
        services: "",
        specialization: "",
        minimum_order: "0",
        lead_time: "",
        rush_capable: false,
        rating: "",
        quality_rating: "",
        reliability_rating: "",
        vps_score_value: "0",
        performance_score: "",
        recommended: false,
        active: true,
        is_available: true,
        max_concurrent_jobs: 1,
        internal_notes: "",
    };
};

const buildFormValuesFromData = (vendor: Vendor): VendorFormValues => {
    return {
        name: vendor.name,
        contact_person: vendor.contact_person ?? "",
        email: vendor.email,
        phone: vendor.phone,
        business_address: vendor.business_address ?? "",
        tax_pin: vendor.tax_pin ?? "",
        payment_terms: vendor.payment_terms ?? "",
        payment_method: vendor.payment_method ?? "",
        services: vendor.services ?? "",
        specialization: vendor.specialization ?? "",
        minimum_order: vendor.minimum_order ?? "0",
        lead_time: vendor.lead_time ?? "",
        rush_capable: vendor.rush_capable,
        rating: vendor.rating ?? "",
        quality_rating: vendor.quality_rating ?? "",
        reliability_rating: vendor.reliability_rating ?? "",
        vps_score_value: String(vendor.vps_score_value ?? "0"),
        performance_score: vendor.performance_score ? String(vendor.performance_score) : "",
        recommended: vendor.recommended,
        active: vendor.active,
        is_available: vendor.is_available,
        max_concurrent_jobs: vendor.max_concurrent_jobs,
        internal_notes: vendor.internal_notes ?? "",
    };
};

const getMissingRequiredFields = (formValues: VendorFormValues): string[] => {
    const missing: string[] = [];

    if (!formValues.name.trim()) {
        missing.push("Vendor name");
    }

    if (!formValues.email.trim()) {
        missing.push("Email");
    }

    if (!formValues.phone.trim()) {
        missing.push("Phone number");
    }

    return missing;
};

const buildCreatePayload = (formValues: VendorFormValues): CreateVendorPayload => {
    return {
        name: formValues.name.trim(),
        contact_person: formValues.contact_person.trim() || null,
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        business_address: formValues.business_address.trim() || null,
        tax_pin: formValues.tax_pin.trim() || null,
        payment_terms: formValues.payment_terms.trim() || null,
        payment_method: formValues.payment_method.trim() || null,
        services: formValues.services.trim() || null,
        specialization: formValues.specialization.trim() || null,
        minimum_order: formValues.minimum_order.trim() || "0",
        lead_time: formValues.lead_time.trim() || null,
        rush_capable: formValues.rush_capable,
        rating: formValues.rating.trim() || "0",
        quality_rating: formValues.quality_rating.trim() || null,
        reliability_rating: formValues.reliability_rating.trim() || null,
        vps_score_value: formValues.vps_score_value.trim() || "0",
        performance_score: 0,
        recommended: formValues.recommended,
        active: formValues.active,
        is_available: formValues.is_available,
        max_concurrent_jobs: formValues.max_concurrent_jobs,
        internal_notes: formValues.internal_notes.trim() || null,
    };
};

const buildUpdatePayload = (formValues: VendorFormValues): UpdateVendorPayload => {
    return {
        name: formValues.name.trim(),
        contact_person: formValues.contact_person.trim() || null,
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        business_address: formValues.business_address.trim() || null,
        tax_pin: formValues.tax_pin.trim() || null,
        payment_terms: formValues.payment_terms.trim() || null,
        payment_method: formValues.payment_method.trim() || null,
        services: formValues.services.trim() || null,
        specialization: formValues.specialization.trim() || null,
        minimum_order: formValues.minimum_order.trim() || "0",
        lead_time: formValues.lead_time.trim() || null,
        rush_capable: formValues.rush_capable,
        rating: formValues.rating.trim() || null,
        quality_rating: formValues.quality_rating.trim() || null,
        reliability_rating: formValues.reliability_rating.trim() || null,
        vps_score_value: formValues.vps_score_value.trim() || "0",
        recommended: formValues.recommended,
        active: formValues.active,
        is_available: formValues.is_available,
        max_concurrent_jobs: formValues.max_concurrent_jobs,
        internal_notes: formValues.internal_notes.trim() || null,
    };
};

export default function VendorFormWorkspace({
    mode,
    vendorId,
    homeLabel,
    homeHref,
    listLabel,
    listHref,
    pageLabel,
    title,
    description,
    submitLabel,
    successRedirectHref,
    cancelRedirectHref,
}: VendorFormWorkspaceProps): ReactElement {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hasValidId = useMemo((): boolean => {
        if (mode === "create") {
            return true;
        }

        return typeof vendorId === "number" && Number.isFinite(vendorId);
    }, [mode, vendorId]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["vendor", vendorId],
        queryFn: (): Promise<Vendor> => fetchVendor(vendorId as number),
        enabled: mode === "edit" && hasValidId,
    });

    const [values, setValues] = useState<VendorFormValues | null>(mode === "create" ? buildInitialValues() : null);

    useEffect((): void => {
        if (mode === "edit" && data && values === null) {
            setValues(buildFormValuesFromData(data));
        }
    }, [mode, data, values]);

    const handleSubmit = async (): Promise<void> => {
        if (!values) {
            return;
        }

        if (mode === "edit" && !hasValidId) {
            setErrorMessage("Invalid vendor ID.");
            return;
        }

        if (mode === "create") {
            const missing = getMissingRequiredFields(values);
            if (missing.length > 0) {
                toast.error(`Please complete: ${missing.join(", ")}.`);
                return;
            }
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            if (mode === "create") {
                await createVendor(buildCreatePayload(values));
                toast.success("Vendor created successfully.");
                router.push(successRedirectHref);
                return;
            }

            await updateVendor(vendorId as number, buildUpdatePayload(values));
            toast.success("Vendor updated successfully.");
            router.push(successRedirectHref);
        } catch (_error: unknown) {
            setErrorMessage("Unable to save the vendor. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        router.push(cancelRedirectHref);
    };

    return (
        <>
            <header className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                        <Link href={homeHref} className="hover:text-brand-blue">
                            {homeLabel}
                        </Link>
                        <span>/</span>
                        <Link href={listHref} className="hover:text-brand-blue">
                            {listLabel}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{pageLabel}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="mt-2 text-sm text-gray-600">{description}</p>
                </div>
            </header>

            <main className="min-h-screen bg-gray-50">
                <div className="max-w-5xl space-y-6 px-8 py-6">
                    {mode === "edit" && !hasValidId ? (
                        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Invalid vendor ID</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        The requested vendor could not be found.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {mode === "edit" && isLoading && hasValidId ? (
                        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="h-6 w-48 rounded bg-gray-200"></div>
                            <div className="mt-3 h-4 w-72 rounded bg-gray-200"></div>
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                {[1, 2, 3, 4].map((item: number): ReactElement => (
                                    <div key={item} className="h-20 rounded bg-gray-100"></div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {mode === "edit" && !isLoading && (error || !data) && hasValidId ? (
                        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Failed to load vendor</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Unable to fetch vendor details. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {errorMessage ? (
                        <div className="rounded-lg border border-brand-red/20 bg-brand-red/10 p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-5 w-5 text-brand-red" />
                                <p className="text-sm text-brand-red">{errorMessage}</p>
                            </div>
                        </div>
                    ) : null}

                    {values ? (
                        <VendorForm
                            values={values}
                            onValuesChange={setValues}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            submitLabel={submitLabel}
                            isSubmitting={isSubmitting}
                        />
                    ) : null}
                </div>
            </main>
        </>
    );
}
