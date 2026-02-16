"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import ProductForm from "@/features/products/components/ProductForm";
import { createProduct, uploadProductGalleryImages, uploadProductPrimaryImage } from "@/services/products";
import type { CreateProductPayload, ProductCustomizationLevel, ProductFormValues } from "@/types/products";

const buildInitialValues = (): ProductFormValues => {
    return {
        name: "",
        short_description: "",
        long_description: "",
        primary_category: "",
        sub_category: "",
        product_family: "",
        product_type: "physical",
        customization_level: "non_customizable",
        status: "draft",
        is_visible: true,
        visibility: "catalog-search",
        base_price: "",
        stock_status: "made_to_order",
        stock_quantity: 0,
        track_inventory: false,
        allow_backorders: true,
        internal_notes: "",
        client_notes: "",
    };
};

const getBasePriceValue = (values: ProductFormValues): number | null => {
    if (values.customization_level === "fully_customizable") {
        return null;
    }
    const parsed = Number(values.base_price);
    return Number.isFinite(parsed) ? parsed : null;
};

const requiresBasePrice = (level: ProductCustomizationLevel): boolean =>
    level === "non_customizable" || level === "semi_customizable";

export default function NewProductPage(): ReactElement {
    const router = useRouter();
    const [values, setValues] = useState<ProductFormValues>(buildInitialValues());
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const buildPayload = (formValues: ProductFormValues): CreateProductPayload => {
        return {
            name: formValues.name.trim(),
            short_description: formValues.short_description.trim(),
            long_description: formValues.long_description.trim(),
            primary_category: formValues.primary_category.trim() || null,
            sub_category: formValues.sub_category.trim() || null,
            product_family: formValues.product_family.trim() || null,
            product_type: formValues.product_type,
            customization_level: formValues.customization_level,
            status: formValues.status,
            is_visible: formValues.is_visible,
            visibility: formValues.visibility,
            base_price: getBasePriceValue(formValues),
            stock_status: formValues.stock_status,
            stock_quantity: formValues.stock_quantity,
            track_inventory: formValues.track_inventory,
            allow_backorders: formValues.allow_backorders,
            internal_notes: formValues.internal_notes.trim(),
            client_notes: formValues.client_notes.trim(),
        };
    };

    const getMissingRequiredFields = (formValues: ProductFormValues): string[] => {
        const missing: string[] = [];

        if (!formValues.name.trim()) {
            missing.push("Product name");
        }

        if (!formValues.short_description.trim()) {
            missing.push("Short description");
        }

        if (!formValues.long_description.trim()) {
            missing.push("Long description");
        }

        if (requiresBasePrice(formValues.customization_level)) {
            const basePrice = getBasePriceValue(formValues);
            if (basePrice === null || basePrice <= 0) {
                missing.push("Base price");
            }
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
            const createdProduct = await createProduct(payload);

            if (primaryImage) {
                await uploadProductPrimaryImage(createdProduct.id, primaryImage, values.name.trim());
            }

            if (galleryImages.length > 0) {
                await uploadProductGalleryImages(createdProduct.id, galleryImages, values.name.trim());
            }

            toast.success("Product created successfully.");
            setTimeout((): void => {
                router.push("/staff/products");
            }, 400);
        } catch (error: unknown) {
            toast.error("Unable to save the product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (): void => {
        router.push("/staff/products");
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
                        <a href="/staff/products" className="hover:text-brand-blue">
                            Products
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">New</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Define catalog details, pricing, and inventory basics.
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="px-8 py-6 space-y-6">
                    <ProductForm
                        values={values}
                        onValuesChange={setValues}
                        onPrimaryImageChange={setPrimaryImage}
                        onGalleryImagesChange={setGalleryImages}
                        selectedPrimaryImageName={primaryImage?.name ?? null}
                        selectedGalleryImageCount={galleryImages.length}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        submitLabel="Create Product"
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
        </AdminLayout>
    );
}
