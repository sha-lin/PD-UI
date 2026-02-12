"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import VendorForm from "@/features/vendors/components/VendorForm";
import { createVendor } from "@/services/vendors";
import { CreateVendorPayload, VendorFormValues } from "@/types/vendors";

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
        vps_score: "",
        vps_score_value: "0",
        performance_score: "",
        recommended: false,
        active: true,
        is_available: true,
        max_concurrent_jobs: 1,
        internal_notes: "",
    };
};

export default function NewVendorPage(): ReactElement {
    const router = useRouter();
    const [values, setValues] = useState<VendorFormValues>(buildInitialValues());
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const buildPayload = (formValues: VendorFormValues): CreateVendorPayload => {
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
            vps_score: formValues.vps_score.trim() || "",
            vps_score_value: formValues.vps_score_value.trim() || "0",
            performance_score: 0,
            recommended: formValues.recommended,
            active: formValues.active,
            is_available: formValues.is_available,
            max_concurrent_jobs: formValues.max_concurrent_jobs,
            internal_notes: formValues.internal_notes.trim() || null,
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

    const handleSubmit = async (): Promise<void> => {
        const missing = getMissingRequiredFields(values);
        if (missing.length > 0) {
            toast.error(`Please complete: ${missing.join(", ")}.`);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = buildPayload(values);
            await createVendor(payload);
            toast.success("Vendor created successfully.");
            setTimeout((): void => {
                router.push("/staff/vendors");
            }, 400);
        } catch (error: unknown) {
            toast.error("Unable to save the vendor. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        router.push("/staff/vendors");
    };

    return (
        <AdminLayout>
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
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
                        <span className="text-gray-900">New</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Vendor</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Add a new supplier profile and performance details
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="px-8 py-6 space-y-6">
                    <VendorForm
                        values={values}
                        onValuesChange={setValues}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        submitLabel="Create Vendor"
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
        </AdminLayout>
    );
}
