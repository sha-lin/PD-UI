"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/admin-layout";
import ProductForm from "@/features/products/components/ProductForm";
import {
    fetchProduct,
    updateProduct,
    uploadProductGalleryImages,
    uploadProductPrimaryImage,
} from "@/services/products";
import type {
    Product,
    ProductCustomizationLevel,
    ProductFormValues,
    UpdateProductPayload,
} from "@/types/products";

const buildFormValuesFromData = (product: Product): ProductFormValues => {
    return {
        name: product.name,
        short_description: product.short_description,
        long_description: product.long_description,
        primary_category: product.primary_category ?? "",
        sub_category: product.sub_category ?? "",
        product_family: product.product_family ?? "",
        product_type: product.product_type,
        customization_level: product.customization_level,
        status: product.status,
        is_visible: product.is_visible,
        visibility: product.visibility,
        base_price: product.base_price !== null ? String(product.base_price) : "",
        stock_status: product.stock_status,
        stock_quantity: product.stock_quantity,
        track_inventory: product.track_inventory,
        allow_backorders: product.allow_backorders,
        internal_notes: product.internal_notes ?? "",
        client_notes: product.client_notes ?? "",
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

export default function EditProductPage(): ReactElement {
    const router = useRouter();
    const params = useParams();
    const productIdParam =
        typeof params.productId === "string"
            ? params.productId
            : Array.isArray(params.productId)
                ? params.productId[0]
                : "";
    const productId = useMemo((): number => Number(productIdParam), [productIdParam]);
    const hasValidId = Number.isFinite(productId);

    const { data, isLoading, error } = useQuery({
        queryKey: ["product", productId],
        queryFn: (): Promise<Product> => fetchProduct(productId),
        enabled: hasValidId,
    });

    const [values, setValues] = useState<ProductFormValues | null>(null);
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect((): void => {
        if (data && !values) {
            setValues(buildFormValuesFromData(data));
        }
    }, [data, values]);

    const buildPayload = (formValues: ProductFormValues): UpdateProductPayload => {
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
        if (!hasValidId) {
            toast.error("Invalid product ID.");
            return;
        }

        if (!values) {
            return;
        }

        const missing = getMissingRequiredFields(values);
        if (missing.length > 0) {
            toast.error(`Please complete: ${missing.join(", ")}.`);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = buildPayload(values);
            await updateProduct(productId, payload);

            if (primaryImage) {
                await uploadProductPrimaryImage(productId, primaryImage, values.name.trim());
            }

            if (galleryImages.length > 0) {
                await uploadProductGalleryImages(productId, galleryImages, values.name.trim());
            }

            toast.success("Product updated successfully.");
            router.push("/staff/products");
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
                        <span className="text-gray-900">Edit</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update catalog details, pricing, and inventory settings.
                    </p>
                </div>
            </header>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
                    {!hasValidId && (
                        <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircleIcon className="h-6 w-6 text-brand-red" />
                                <div>
                                    <h3 className="font-semibold text-brand-red">Invalid product ID</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        The requested product could not be found.
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
                                    <h3 className="font-semibold text-brand-red">Failed to load product</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Unable to fetch product details. Please try again later.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {values && data && (
                        <ProductForm
                            values={values}
                            onValuesChange={setValues}
                            onPrimaryImageChange={setPrimaryImage}
                            onGalleryImagesChange={setGalleryImages}
                            selectedPrimaryImageName={primaryImage?.name ?? null}
                            selectedGalleryImageCount={galleryImages.length}
                            existingImageCount={data.image_count}
                            hasExistingPrimaryImage={Boolean(data.primary_image_url)}
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
