"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import VendorForm from "@/features/vendors/components/VendorForm";
import { fetchVendor, updateVendor } from "@/services/vendors";
import { UpdateVendorPayload, Vendor, VendorFormValues } from "@/types/vendors";

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
        vps_score: vendor.vps_score ?? "",
        vps_score_value: String(vendor.vps_score_value ?? "0"),
        performance_score: vendor.performance_score ? String(vendor.performance_score) : "",
        recommended: vendor.recommended,
        active: vendor.active,
        is_available: vendor.is_available,
        max_concurrent_jobs: vendor.max_concurrent_jobs,
        internal_notes: vendor.internal_notes ?? "",
    };
};

export default function EditVendorPage(): ReactElement {
    const router = useRouter();
    const params = useParams();
    const vendorIdParam =
        typeof params.vendorId === "string"
            ? params.vendorId
            : Array.isArray(params.vendorId)
                ? params.vendorId[0]
                : "";
    const vendorId = useMemo((): number => Number(vendorIdParam), [vendorIdParam]);
    const hasValidId = Number.isFinite(vendorId);

    const { data, isLoading, error } = useQuery({
        queryKey: ["vendor", vendorId],
        queryFn: (): Promise<Vendor> => fetchVendor(vendorId),
        enabled: hasValidId,
    });

    const [values, setValues] = useState<VendorFormValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect((): void => {
        if (data && !values) {
            setValues(buildFormValuesFromData(data));
        }
    }, [data, values]);

    const buildPayload = (formValues: VendorFormValues): UpdateVendorPayload => {
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
            vps_score: formValues.vps_score.trim() || null,
            vps_score_value: formValues.vps_score_value.trim() || "0",
            recommended: formValues.recommended,
            active: formValues.active,
            is_available: formValues.is_available,
            max_concurrent_jobs: formValues.max_concurrent_jobs,
            internal_notes: formValues.internal_notes.trim() || null,
        };
    };

    const handleSubmit = async (): Promise<void> => {
        if (!hasValidId) {
            setErrorMessage("Invalid vendor ID.");
            return;
        }

        if (!values) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const payload = buildPayload(values);
            await updateVendor(vendorId, payload);
            router.push("/staff/vendors");
        } catch (error: unknown) {
            setErrorMessage("Unable to save the vendor. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        router.push("/staff/vendors");
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
                        <a href="/staff/vendors" className="hover:text-brand-blue">
                            Vendors
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">Edit</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update vendor details, capacity, and performance scores
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
                                    <h3 className="font-semibold text-brand-red">Invalid vendor ID</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        The requested vendor could not be found.
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
                                    <h3 className="font-semibold text-brand-red">Failed to load vendor</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch vendor details. Please try again later.
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
                        <VendorForm
                            values={values}
                            onValuesChange={setValues}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            submitLabel="Save Changes"
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
